# Codex MCP Integration

Lightweight Express bridge that spawns `codex app-server` and exposes a simple HTTP API for the frontend app.

## What it does
- Accepts prompts from the browser and forwards them to Codex
- Initializes the app-server once and reuses it for all requests
- Exposes a small API surface for the frontend client wrapper

## Endpoints
- `POST /api/codex`
  - Body: `{ "prompt": string, "threadId"?: string }`
  - Response: `{ "threadId": string, "result": string }`
- `GET /api/threads`
  - Response: `{ "threads": string[] }`
- `GET /api/codex/events`
  - Server-sent events stream of app-server notifications

## Environment
- `CODEX_PORT` (default: `3001`)
- `CODEX_ORIGIN` (default: `http://localhost:5173`)
- `CODEX_MODEL` (default: `gpt-5.1-codex`)

## Local usage
1. Ensure the `codex` CLI is installed and on PATH.
2. Start the server: `node codex-integration/server/index.js`.
2. The frontend client calls `POST /api/codex` on `http://localhost:3001` by default.

## Notes
- Threads are stored by the Codex app-server and reset when it restarts.
- Add persistence if you need long-lived sessions.
