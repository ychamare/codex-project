import express from "express";
// Express bridge that proxies prompts to the Codex app-server and streams events.
import cors from "cors";
import { spawn } from "node:child_process";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { buildCodexPrompt } from "./prompt-builder.js";

const app = express();
const PORT = Number(process.env.CODEX_PORT ?? 3001);
const ORIGIN = process.env.CODEX_ORIGIN ?? "http://localhost:5173";
const CODEX_MODEL = process.env.CODEX_MODEL ?? "gpt-5.1-codex";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const TEMPLATE_DIR = path.join(REPO_ROOT, "store-front-template");
const STAGED_APPS_DIR = path.join(REPO_ROOT, "src", "staged-store-front");

// Basic middleware for CORS + JSON bodies.
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ limit: "1mb" }));

// Spawn the Codex app-server and speak JSON-RPC over stdio.
const proc = spawn("codex", ["app-server"], {
  stdio: ["pipe", "pipe", "inherit"],
});

const rl = readline.createInterface({ input: proc.stdout });
const pending = new Map();
const notificationListeners = new Set();
const sseClients = new Set();
let nextId = 1;
let initialized = false;
let initPromise = null;

const send = (message) => {
  proc.stdin.write(`${JSON.stringify(message)}\n`);
};

const request = (method, params) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    send({ method, id, params });
  });

const broadcast = (message) => {
  for (const res of sseClients) {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  }
};

const ensureInitialized = async () => {
  if (initialized) return;
  if (initPromise) {
    await initPromise;
    return;
  }
  initPromise = (async () => {
    await request("initialize", {
      clientInfo: {
        name: "codex-app",
        title: "Codex App",
        version: "0.1.0",
      },
    });
    send({ method: "initialized", params: {} });
    initialized = true;
  })();
  await initPromise;
};

const waitForTurn = (threadId, turnId) =>
  new Promise((resolve, reject) => {
    let finalText = "";
    let completed = false;

    const onNotify = (msg) => {
      if (!msg || typeof msg !== "object") return;
      if (msg.method === "item/agentMessage/delta") {
        if (msg.params?.turnId === turnId) {
          finalText += msg.params?.delta ?? "";
        }
      }
      if (msg.method === "item/completed") {
        const item = msg.params?.item;
        if (msg.params?.turnId === turnId && item?.type === "agentMessage") {
          finalText = item.text ?? finalText;
        }
      }
      if (msg.method === "turn/completed" && msg.params?.turn?.id === turnId) {
        completed = true;
        const status = msg.params?.turn?.status;
        notificationListeners.delete(onNotify);
        if (status === "failed") {
          const message = msg.params?.turn?.error?.message ?? "Codex turn failed";
          reject(new Error(message));
          return;
        }
        resolve(finalText);
      }
    };

    notificationListeners.add(onNotify);

    const timeout = setTimeout(() => {
      if (!completed) {
        notificationListeners.delete(onNotify);
        reject(new Error("Codex turn timed out"));
      }
    }, 600000);

    const cleanup = (result) => {
      clearTimeout(timeout);
      return result;
    };

    const originalResolve = resolve;
    const originalReject = reject;
    resolve = (value) => originalResolve(cleanup(value));
    reject = (err) => originalReject(cleanup(err));
  });

rl.on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }

  if (msg && Object.prototype.hasOwnProperty.call(msg, "id")) {
    const pendingRequest = pending.get(msg.id);
    if (pendingRequest) {
      pending.delete(msg.id);
      if (msg.error) {
        pendingRequest.reject(new Error(msg.error.message || "Codex error"));
      } else {
        pendingRequest.resolve(msg);
      }
    }
    return;
  }

  broadcast(msg);
  for (const listener of notificationListeners) {
    listener(msg);
  }
});

// SSE endpoint for streaming app-server notifications to the client.
app.get("/api/codex/events", (_req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write("event: ready\ndata: {}\n\n");

  sseClients.add(res);
  res.on("close", () => {
    sseClients.delete(res);
  });
});

// Send prompt to Codex app-server (create thread on first request, reuse on follow-ups).
app.post("/api/codex", async (req, res) => {
  try {
    const { prompt, threadId, appRequirement } = req.body ?? {};

    await ensureInitialized();

    let activeThreadId = threadId;
    if (!activeThreadId) {
      const threadStart = await request("thread/start", { model: CODEX_MODEL });
      activeThreadId = threadStart.result?.thread?.id;
    }

    if (!activeThreadId) {
      res.status(500).json({ error: "Failed to start thread" });
      return;
    }

    const resolvedPrompt = prompt
      ? prompt
      : appRequirement
        ? buildCodexPrompt({
            templateDir: TEMPLATE_DIR,
            assetsDir: path.join(REPO_ROOT, "asset_packages", appRequirement.package_id),
            prompts: appRequirement.prompts,
            threadId: activeThreadId,
            stagedAppsDir: STAGED_APPS_DIR,
          })
        : null;

    if (!resolvedPrompt || typeof resolvedPrompt !== "string") {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const turnStart = await request("turn/start", {
      threadId: activeThreadId,
      input: [{ type: "text", text: resolvedPrompt }],
    });

    const turnId = turnStart.result?.turn?.id;
    if (!turnId) {
      res.status(500).json({ error: "Failed to start turn" });
      return;
    }

    const result = await waitForTurn(activeThreadId, turnId);
    res.json({ threadId: activeThreadId, result });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// List active threads to help debugging / UI state recovery.
app.get("/api/threads", async (_req, res) => {
  try {
    await ensureInitialized();
    const response = await request("thread/loaded/list");
    res.json({ threads: response.result?.data ?? [] });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Purge staged apps under /src/staged-store-front.
app.post("/api/staged-apps/purge", async (_req, res) => {
  try {
    const entries = await fs.readdir(STAGED_APPS_DIR, { withFileTypes: true });
    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => fs.rm(path.join(STAGED_APPS_DIR, entry.name), { recursive: true, force: true }))
    );
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// List staged app directories under /src/staged-store-front.
app.get("/api/staged-apps/list", async (_req, res) => {
  try {
    const entries = await fs.readdir(STAGED_APPS_DIR, { withFileTypes: true });
    const apps = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    res.json({ apps });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Codex app-server bridge running at http://localhost:${PORT}`);
});
