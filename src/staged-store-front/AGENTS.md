# AGENTS.md (staged store fronts)

<INSTRUCTIONS>
You are operating inside src/staged-store-front/<SESSION_ID>.

Rules:
- Do not modify files outside src/staged-store-front/<SESSION_ID>.
- Use /store-front-template as the starting point for structure and styling.
- Copy the template HTML/CSS/JS into this folder so it can be served by the existing dev server.
- Ensure index.html uses script src `/staged-store-front/<SESSION_ID>/src/main.js` (no `/src` prefix).
- Any asset paths in JS/CSS must use `/staged-store-front/<SESSION_ID>/assets/...` (no `/src` prefix).
- Replace placeholders with the provided assets (logo, hero, product 1–3, about) from /asset_packages/<package_id>.
- Generate brand-appropriate copy/layout based on the natural language prompts.
- Keep the aesthetic clean, premium, spacious, rounded cards, soft borders.
- Output must be reachable at: http://localhost:5173/staged-store-front/<SESSION_ID>/index.html

Staging plan (follow in order):
1) Setup
   - Create the folder src/staged-store-front/<SESSION_ID> if it does not exist.
   - Copy: /store-front-template/index.html, /store-front-template/src/main.js, /store-front-template/src/style.css.
2) Asset wiring
   - Copy assets from /asset_packages/<package_id>/ into src/staged-store-front/<SESSION_ID>/assets/.
   - Update any asset references to `/staged-store-front/<SESSION_ID>/assets/<file>`.
3) Layout build
   - Assemble: logo header, hero, products 1–3, about.
   - Keep sections breathing: generous spacing, rounded cards, soft borders.
4) Brand copy
   - Use prompts to craft: headline, subhead, CTA, product/service blurbs, about story.
   - Keep tone aligned with the asset pack (Bakery/Rock/Fitness/Cat Toys).
5) Polish pass
   - Verify hero + products + about images/videos render.
   - Ensure typography hierarchy is clear and navigation is minimal.
   - Keep the page balanced and visually cohesive.
</INSTRUCTIONS>
