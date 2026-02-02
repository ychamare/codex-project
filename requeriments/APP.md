# APP.md — Codex MCP App Requirements

## Purpose
Defines the payload sent to the Codex MCP server to generate the storefront based on Step 2 inputs and selected asset package.

## app_requirement (payload)

```json
{
  "app_requirement": {
    "package_id": "bakery",
    "assets": {
      "logo": "/bakery/logo.png",
      "hero": "/bakery/Hero.png",
      "products": ["/bakery/product-1.png", "/bakery/product-2.png", "/bakery/product-3.png"],
      "about": "/bakery/about.png"
    },
    "prompts": {
      "brand_mission": "...",
      "product_special": "...",
      "ui_preferences": "...",
      "product_organization": "...",
      "hero_logo_messaging": "...",
      "additional_notes": "..."
    }
  }
}
```

## Notes
- `package_id` maps to the selected asset package in Step 1.
- `assets` must reflect the exact file paths served from `/asset_packages`.
- `prompts` are raw natural-language strings captured in Step 2.

## Template Expectations (store-front-template)
- The blank canvas template includes placeholders for **logo, hero, product 1–3, about**.
- Codex should replace those placeholders with the selected assets and generate copy/layout.
- Keep the aesthetic aligned to the staging UI: clean, premium, generous whitespace, rounded cards, soft borders.

## Prompt Builder (server-side)
- The server builds a Codex prompt using:
  - Template directory: `/store-front-template`
  - Asset package directory: `/asset_packages/<package_id>`
  - Staged route directory: `/src/staged-store-front/<session_id>`
- Codex must copy the template into the staged app directory (no new dev server).
- Codex must not start a new dev server; it must write files under `/src/staged-store-front/<session_id>` and return the route URL for staging embed.

## Auth (Auth0 user/password)
- The UI is gated by Auth0 (Universal Login).
- Frontend reads `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`.
- If auth is configured, hide the app until a session is present.

## MCP client and Codex app-server wrapper

This app uses the **Codex app-server** protocol and a lightweight Express bridge that speaks JSON-RPC over stdio to the Codex process, plus a small frontend client wrapper.
The goal is that you can rebuild this integration from scratch using only the steps below.

### Server (Express + Codex app-server)
- File: `codex-integration/server/index.js`
- Starts an Express app with CORS and JSON parsing.
- Spawns `codex app-server` and sends JSON-RPC messages over stdio.
- Initializes the app-server once (`initialize` + `initialized`), then issues `thread/start` and `turn/start` per request.
- Endpoints:
  - `POST /api/codex` body: `{ "prompt": string, "threadId"?: string }`
    - If `threadId` is missing, the server calls `thread/start`.
    - The server calls `turn/start`, waits for `turn/completed`, and returns the final agent message.
    - Returns `{ "threadId": string, "result": string }`.
  - `GET /api/threads` returns active thread ids via `thread/loaded/list`.
  - `GET /api/codex/events` streams app-server notifications (SSE).
- Env:
  - `CODEX_PORT` (default `3001`)
  - `CODEX_ORIGIN` (default `http://localhost:5173`)
  - `CODEX_MODEL` (default `gpt-5.1-codex`)

### Client (frontend wrapper)
- File: `src/codex-client.js`
- Exposes `createCodexClient()` and a singleton `codex` with:
  - `codex.send(prompt)` → calls `POST /api/codex`
  - `codex.listThreads()` → calls `GET /api/threads`
  - `codex.setThreadId(id)` / `codex.getThreadId()` for continuity
  - `codex.subscribe(handler)` → opens SSE and streams app-server notifications
- Example usage lives in `src/main.js` (see `askCodex()`).

### Dev scripts
- `npm run dev` runs the Vite client and the server concurrently.
- `npm run dev:server` starts the Express bridge.
- `npm run dev:client` starts Vite.

### Rebuild checklist (from scratch)
1. Install deps: `npm install` (needs `express`, `cors`, `concurrently`).
2. Ensure the `codex` CLI is installed and available on PATH.
3. Create the server file at `codex-integration/server/index.js` with:
   - Express app + `cors` + `express.json()`.
   - Spawn `codex app-server` and read JSONL from stdout.
   - Implement `initialize` + `initialized` handshake once.
   - `POST /api/codex` → `thread/start` (if needed) → `turn/start` → wait for `turn/completed`.
   - `GET /api/threads` → `thread/loaded/list`.
   - Optional `GET /api/codex/events` for SSE of notifications.
   - `app.listen(PORT)` with `CODEX_PORT` + `CODEX_ORIGIN` defaults.
3. Create the client file at `src/codex-client.js` with:
   - `createCodexClient({ baseUrl })` and in-memory `activeThreadId`.
   - `sendPrompt(prompt, threadId?)` calling `POST /api/codex`.
   - `listThreads()` calling `GET /api/threads`.
   - Export a singleton `codex` with `send`, `listThreads`, `setThreadId`, `getThreadId`.
4. In `src/main.js`, import `codex` and use `codex.send(...)` where needed.
5. Update `package.json` scripts to run server + client concurrently:
   - `dev`, `dev:client`, `dev:server` (see above).
