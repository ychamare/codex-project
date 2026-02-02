// Client wrapper for the Codex MCP Express bridge (HTTP + SSE).
// Small fetch wrapper that talks to the Express bridge.
export const createCodexClient = (options = {}) => {
  const baseUrl = options.baseUrl ?? "http://localhost:3001";
  let activeThreadId = null;

  const request = async (path, init) => {
    const response = await fetch(`${baseUrl}${path}`, init);
    if (!response.ok) {
      const message = await response.text();
      const error = new Error(message || `Request failed: ${response.status}`);
      error.status = response.status;
      error.payload = message;
      throw error;
    }
    return await response.json();
  };

  // Sends a prompt. If a thread already exists, it will be reused.
  const sendPrompt = async (prompt, threadId, appRequirement) => {
    const payload = {
      prompt,
      threadId: threadId ?? activeThreadId ?? undefined,
      appRequirement,
    };

    const doRequest = () =>
      request("/api/codex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

    let result;
    try {
      result = await doRequest();
    } catch (error) {
      const errorText = String(error?.payload ?? error?.message ?? "");
      if (errorText.includes("thread not found")) {
        // Reset thread and retry once.
        activeThreadId = null;
        payload.threadId = undefined;
        result = await doRequest();
      } else {
        throw error;
      }
    }

    activeThreadId = result.threadId;
    return result;
  };

  // Useful for debugging or restoring state after refresh.
  const listThreads = () =>
    request("/api/threads", {
      method: "GET",
    });

  const setThreadId = (threadId) => {
    activeThreadId = threadId;
  };

  const getThreadId = () => activeThreadId;

  // Subscribe to app-server notifications via SSE.
  const subscribe = (onMessage) => {
    const source = new EventSource(`${baseUrl}/api/codex/events`);
    if (onMessage) {
      source.addEventListener("message", (event) => {
        try {
          onMessage(JSON.parse(event.data));
        } catch {
          onMessage(event.data);
        }
      });
    }
    return source;
  };

  return {
    sendPrompt,
    listThreads,
    setThreadId,
    getThreadId,
    subscribe,
  };
};

// Default singleton for simple usage.
const client = createCodexClient();

export const codex = {
  send: client.sendPrompt,
  listThreads: client.listThreads,
  setThreadId: client.setThreadId,
  getThreadId: client.getThreadId,
  subscribe: client.subscribe,
};
