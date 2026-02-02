// Builds the system prompt that instructs Codex how to stage the storefront app.
import path from "node:path";

const formatPrompts = (prompts) => {
  if (!prompts) return "";
  return Object.entries(prompts)
    .map(([key, value]) => `- ${key}: ${value || "(empty)"}`)
    .join("\n");
};

export const buildCodexPrompt = ({
  templateDir,
  assetsDir,
  prompts,
  threadId,
  stagedAppsDir,
}) => {
  const safeThread = threadId || "<SESSION_ID>";
  const stagedDir = path.join(stagedAppsDir, safeThread);

  return [
    "You are Codex running a storefront generation job.",
    "\nGoals:",
    "1) Create a new app by copying the template directory.",
    "2) Use the provided assets and natural-language prompts to build a beautiful storefront.",
    "3) Preserve the app in a staged apps directory keyed by session id.",
    "\nRequired paths:",
    `- Template directory: ${templateDir}`,
    `- Asset package directory: ${assetsDir}`,
    `- Staged route base directory: ${stagedAppsDir}`,
    `- New route directory (must be created): ${stagedDir}`,
    "\nInstructions:",
    "- Copy the template files (index.html, src/main.js, src/style.css) into the new route directory.",
    "- Ensure the entry HTML (index.html) and JS are inside the route directory so Vite can serve it at /staged-store-front/<SESSION_ID>/index.html.",
    "- The index.html script src MUST be /staged-store-front/<SESSION_ID>/src/main.js (do NOT prefix with /src).",
    "- Any asset base paths inside JS/CSS must use /staged-store-front/<SESSION_ID>/assets (no /src prefix).",
    "- Replace placeholder assets with assets from the package directory:",
    "  - logo, hero, product-1, product-2, product-3, about.",
    "- Generate meaningful brand copy and layout based on these prompts:",
    formatPrompts(prompts),
    "- Keep the aesthetic clean, premium, spacious, rounded cards, soft borders.",
    "- Update the template HTML/CSS/JS as needed to produce the final storefront.",
    "- Do not start a new dev server; use the existing app server.",
    "- Return a short summary and the route URL: http://localhost:5173/staged-store-front/<SESSION_ID>/index.html",
  ].join("\n");
};
