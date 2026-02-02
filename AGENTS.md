# AGENTS.md

<INSTRUCTIONS>
## Purpose
This file provides project-specific instructions for Codex-style agents working in this repo.

## Repo basics
- Root: /Users/ychamare/Documents/Builds-local/ychamare/codex-project
- Language: HTML/CSS/JavaScript
- Package manager: npm
- Build command: npm run build
- Test command: (not configured)

## Workflow
- Prefer small, focused edits.
- Update or add tests when changing behavior.
- Keep output concise; link to files instead of pasting large diffs.
- Update `requeriments/UI.md` and `requeriments/APP.md` when UI or staging flow changes.
- Keep the staging flow working: Step 1 (assets), Step 2 (prompts), Step 3 (build + adjust).

## Conventions
- Code style: Tailwind utility-first, semantic HTML
- File organization: Vite `src/` root with `asset_packages/` served as public dir
- Naming: kebab-case for assets, data-attributes for UI wiring

## Key paths
- UI root: `src/index.html`, `src/main.js`, `src/styles.css`
- Asset packs: `asset_packages/<package_id>/` (logo, hero, product-1..3, about)
- Staged apps: `src/staged-store-front/<session_id>/`
- Codex bridge: `codex-integration/server/index.js`
- Codex prompt builder: `codex-integration/server/prompt-builder.js`

## Staging rules
- Staged entry file must be `src/staged-store-front/<session_id>/index.html`.
- Staged script src must be `/staged-store-front/<session_id>/src/main.js` (no `/src` prefix).
- Asset paths must be `/staged-store-front/<session_id>/assets/<file>` (no `/src` prefix).
- Codex must not start a new dev server; it writes into the staged folder and returns the route URL.

## App flow
- Step 1: choose asset package and preview all assets (supports images + video).
- Step 2: enter natural-language prompts (mission, special, UI prefs, organization, hero/logo, notes).
- Step 3: build storefront, show staging iframe, and allow adjustments on the same thread.
- CODEX RESPONSE opens `/codex-response/<threadId>` and streams the server output.
- App History lists UUIDs, loads the selected app into staging, and updates the active thread.

## Safety
- Do not delete files unless explicitly requested.
- If requirements are ambiguous, ask a clarifying question before making changes.
</INSTRUCTIONS>
