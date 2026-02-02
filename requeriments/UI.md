# Storefront Template UI Requirements

## Overview

A brand showcase storefront template for an eCommerce marketplace platform. This template serves as the base canvas that Codex will dynamically modify based on user prompts. Users select from pre-created image assets during onboarding, then interact with Codex to customize the UI.

---

## Overarching Guidance (Rebuildable Spec)

This document must be sufficient to recreate the exact app in a new Codex project. Follow these rules:
- Use a **3‑step staging flow** with a progress indicator and Back/Continue controls.
- Step 1 is **package‑only**: selecting a package auto-fills all assets. No individual asset pickers.
- Step 2 is **natural language input** fields for Codex to interpret.
- Step 3 is a **full storefront preview** that uses the selected package assets.
- Keep layout desktop‑first with responsive stacking for tablet/mobile.
- All Step 1 assets must render **fully visible** in fixed‑size tiles using `object-contain`.
- Gate the app behind **Auth0**. When signed out, hide the main app and show the login panel.

### Auth (Auth0)
- Add a slim auth panel at the top with:
  - “Sign in with Auth0” button
  - Signed‑in email display + “Sign out” button
  - Small status text for feedback
- If auth is not configured, show the app with a warning message.

---

## Steps 1–3 (Staging Flow)

### Step 1 — Select Asset Package (DEMO)

**Purpose:** Choose a complete asset bundle for staging.

**Positioning + Layout:**
- Top header bar shows app title on the left and a **Step X of 3** indicator on the right.
- A horizontal progress bar sits below the header (three segments).
- In the Step 1 section, the **package selector sits left-aligned next to the “Select Asset Package (DEMO)” title**.
- The package selector includes a larger logo thumbnail + a dropdown (Bakery, Rock Climbing, Fitness, Cat Toys).

**Asset Board (grid-only, no copy/CTA):**
- Below the selector, show a labeled asset grid with tiles:
  - Logo (small tile)
  - Hero (wide tile)
  - Product 1–3 (three equal tiles)
  - About (wide tile)
- Tiles use fixed heights and **`object-contain`** so the full image or video is always visible (no cropping).
- If an asset is video, swap the image for a muted looping video element.

### Step 2 — Natural Language Inputs

**Purpose:** Capture brand intent and UI direction for Codex.

**Positioning + Layout:**
- Step 2 replaces Step 1 content (same header + progress bar).
- Show a two‑column grid of text areas (stacked on mobile).

**Fields (natural language):**
- Brand mission
- What makes the product special
- UI preferences / layout direction
- Product organization
- Hero + logo messaging
- Additional notes

**Demo dropdowns (Step 2):**
- Each field includes a dropdown with preset ideas so the user can select instead of typing.
- Brand mission dropdown includes 4 preset missions: Fitness, Bakery, Rock Climbing, Cat Toys (full text).
- “What makes the product special” dropdown includes **4 total options** (2 product-focused + 2 service-focused).

### Step 3 — Full Storefront Preview

**Purpose:** Render the full storefront using Step 2 guidance and Step 1 assets.

**Positioning + Layout:**
- Step 3 replaces Step 2 content (same header + progress bar).
- Full storefront preview shows header, hero, products, about, and footer.
- Uses selected package assets for logo, hero, products, and about.

**Step 3 Build Flow (MCP-driven):**
- On entering Step 3, show a **large empty square staging area** (placeholder state).
- Provide a **“Create Storefront”** button next to the Step 3 title on the left.
- Clicking the button sends the **app_requirement** payload to the Codex MCP server.
- While building, display a **streamed animation/progress** inside the staging area.
- When the build completes, replace the empty stage with the generated storefront.
- Below the stage, show a **natural language adjustment field**; submitting sends update prompts to MCP.
- Add a **“CODEX RESPONSE”** link next to the **Create Storefront** button; it opens `/codex-response/<threadId>` in a new tab and streams the output.
- Provide an **App History** dropdown (UUID list) that loads the selected staged app into the iframe and switches the active thread for adjustments.
- Persist the MCP thread ID locally so adjustments reuse the same session.

**Data Hand-off:**
- Step 2 fields are packaged into `app_requirement.prompts`.
- Step 1 package selection maps to `app_requirement.package_id` + `assets`.
- See `requeriments/APP.md` for the exact payload shape.

---

## Asset Picker Interface

### Step 1 Layout (Package Board)

**Staging mode only — package selection (no asset dropdowns).**

- The package selector sits left of the Step 1 title.
- Label reads **“Asset Package (DEMO)”**.
- Selecting a package immediately updates the grid board + Step 3 preview.
- The board shows: Logo, Hero, Product 1–3, About.
- Each tile uses a fixed height and **`object-contain`** to show the full image/video.

**Image/Video Requirements Panel**
- Logo: 200×60 (variable)
- Hero: 1920×1080 (16:9)
- Product 1–3: 800×800 (1:1)
- About: 800×600 (4:3)
- Video formats: mp4 / webm, muted loop, under ~10s

**Available packages (staging):**
- Bakery
- Rock Climbing
- Fitness (includes a video asset)
- Cat Toys

### Asset File Organization

```
/asset_packages/
  /bakery/
    Hero.png
    product-1.png
    product-2.png
    product-3.png
    about.png
    logo.png
  /rock_climbing/
    hero.JPG
    product-1.jpg
    product-2.jpg
    product-3.jpg
    About.jpeg
    logo.png
  /fitness/
    Hero.jpg
    product-1.png
    product-2.png
    product-3.mp4
    about.png
    logo.png
  /cat_toys/
    hero.png
    product-1.png
    prodcut-2.png
    product-3.png
    about.png
    logo.png
```

### Asset Package Manifest (JSON)

```json
{
  "packages": [
    {
      "id": "bakery",
      "label": "Bakery",
      "logo": "/bakery/logo.png",
      "hero": "/bakery/Hero.png",
      "products": ["/bakery/product-1.png", "/bakery/product-2.png", "/bakery/product-3.png"],
      "about": "/bakery/about.png"
    },
    {
      "id": "rock_climbing",
      "label": "Rock Climbing",
      "logo": "/rock_climbing/logo.png",
      "hero": "/rock_climbing/hero.JPG",
      "products": ["/rock_climbing/product-1.jpg", "/rock_climbing/product-2.jpg", "/rock_climbing/product-3.jpg"],
      "about": "/rock_climbing/About.jpeg"
    },
    {
      "id": "fitness",
      "label": "Fitness",
      "logo": "/fitness/logo.png",
      "hero": "/fitness/Hero.jpg",
      "products": ["/fitness/product-1.png", "/fitness/product-2.png", "/fitness/product-3.mp4"],
      "about": "/fitness/about.png"
    },
    {
      "id": "cat_toys",
      "label": "Cat Toys",
      "logo": "/cat_toys/logo.png",
      "hero": "/cat_toys/hero.png",
      "products": ["/cat_toys/product-1.png", "/cat_toys/prodcut-2.png", "/cat_toys/product-3.png"],
      "about": "/cat_toys/about.png"
    }
  ]
}
```

### Live Preview Behavior

**Initial State:**
- Template loads with placeholder images (gray boxes or default set)
- Shows store name from Step 1 in header/hero

**On Asset Package Select (Step 1):**
- Logo, Hero, Product 1–3, About update in one action
- Grid board updates immediately

**On Step 3 Preview:**
- Uses the same selected package assets for the full storefront render

**Video Asset Behavior:**
- If a selected asset is a video, swap the image for a looping muted video element
- For hero video, replace background image with a full-bleed video layer

**Preview Update Logic:**
```javascript
function applyPackage(pkg) {
  document.querySelector('#preview-logo').src = pkg.logo;
  document.querySelector('#preview-hero').style.backgroundImage = `url(${pkg.hero})`;
  document.querySelector('#preview-product-1').src = pkg.products[0];
  document.querySelector('#preview-product-2').src = pkg.products[1];
  document.querySelector('#preview-product-3').src = pkg.products[2];
  document.querySelector('#preview-about-image').src = pkg.about;
}
```

**Video Handling (pseudo):**
```javascript
function onAssetSelect(category, assetId, assetPath, type) {
  if (type === 'video') {
    showVideo(category, assetPath);
  } else {
    showImage(category, assetPath);
  }
}
```

### Selection State Object

```javascript
const storefrontState = {
  step1: {
    selectedPackageId: "bakery"
  },
  step2: {
    brandMission: "Handmade bakery that celebrates slow mornings.",
    productSpecial: "Small-batch recipes and seasonal flavors.",
    uiPreferences: "Warm, bright, airy, lots of whitespace.",
    productOrganization: "Group by morning, afternoon, evening.",
    heroLogoMessaging: "Highlight the daily ritual and freshness.",
    additionalNotes: "Favor rounded shapes and soft shadows."
  }
};
```

### Validation Before Continue

```javascript
function canProceed() {
  return Boolean(storefrontState.step1.selectedPackageId);
}
```

### Asset Checklist for Demo

| Category | Minimum Assets | Target |
|----------|----------------|--------|
| Logo | 3 | 5 |
| Hero backgrounds | 3 | 5 |
| Product images | 6 | 10 |
| About images | 3 | 5 |
| Backgrounds | 2 + None | 3 + None |

**Total minimum: 18 assets**
**Target: 29 assets**

---

## Template Type

**Brand Showcase Storefront**

A single-page storefront designed to tell a brand's story, showcase featured products, and build trust through social proof. Optimized for desktop-first with responsive considerations.

---

## Page Sections

### 1. Header

**Purpose:** Navigation and brand identity

**Elements:**
- Logo (image or text-based, left-aligned)
- Navigation links (horizontal menu, center or right-aligned)
  - Home
  - Products
  - About
  - Contact
- Cart icon with item count badge (right-aligned)
- Optional: Search icon

**Behavior:**
- Sticky on scroll (optional, Codex can toggle)
- Mobile: Collapses to hamburger menu

**Codex Modifiable:**
- Background color / transparency
- Logo style (text vs image placeholder)
- Nav link arrangement
- Sticky behavior
- Typography

---

### 2. Hero Section

**Purpose:** First impression, brand statement, primary CTA

**Elements:**
- Full-width background image (user-selected from gallery)
- Headline text (brand tagline or value proposition)
- Subheadline / supporting text
- Primary CTA button (e.g., "Shop Now", "Explore Collection")
- Optional: Secondary CTA (e.g., "Learn More")

**Layout Variants:**
- Centered text overlay
- Left-aligned text with right image
- Split 50/50 layout

**Codex Modifiable:**
- Layout variant
- Text alignment
- Background overlay opacity/color
- Button style and text
- Typography (font, size, weight)
- Spacing and padding

**Assets (user-selected during onboarding):**
- Hero background image or video from pre-created gallery

---

### 3. Product Grid / Featured Products

**Purpose:** Showcase key products

**Elements:**
- Section title (e.g., "Featured Products", "Best Sellers")
- Product cards (grid layout)
  - Product image or short loop video (user-selected from gallery)
  - Product name
  - Price
  - Optional: Quick description or tag (e.g., "New", "Sale")
- Optional: "View All" link

**Layout:**
- Default: 3-4 columns on desktop
- Responsive: 2 columns tablet, 1 column mobile

**Codex Modifiable:**
- Grid columns (2, 3, 4)
- Card style (minimal, bordered, shadowed, hover effects)
- Image aspect ratio
- Typography and spacing
- Section background color
- Number of products displayed (max 3 for demo)

**Assets (user-selected during onboarding):**
- Product images or videos from pre-created gallery (3 required)

---

### 4. About / Brand Story Section

**Purpose:** Build connection, tell the brand narrative

**Elements:**
- Section title (e.g., "Our Story", "About Us")
- Body text (2-3 paragraphs, Codex-generated from user narrative)
- Supporting image or short loop video (user-selected from gallery)
- Optional: Founder quote or mission statement
- Optional: CTA button ("Learn More")

**Layout Variants:**
- Text left, image right
- Image left, text right
- Full-width text with background image

**Codex Modifiable:**
- Layout variant
- Text content (generated from user prompt)
- Typography and spacing
- Background treatment

**Assets (user-selected during onboarding):**
- About/lifestyle image or video from pre-created gallery

---

### 6. Footer

**Purpose:** Secondary navigation, contact info, newsletter signup

**Elements:**
- Logo (smaller version)
- Navigation columns
  - Shop (links to product categories)
  - Company (About, Contact, Careers)
  - Support (FAQ, Shipping, Returns)
- Newsletter signup
  - Heading text
  - Email input field
  - Submit button
- Social media icons (Instagram, Twitter/X, Facebook, TikTok, etc.)
- Copyright text
- Optional: Payment method icons

**Layout:**
- Multi-column on desktop (3-4 columns)
- Stacked on mobile

**Codex Modifiable:**
- Column arrangement
- Background color
- Typography
- Social icons selection
- Newsletter copy

---

## Design System

### Typography

**Font Pairing Defaults:**
- Headings: Sans-serif (Inter, Poppins, or similar)
- Body: Sans-serif (matching or complementary)

**Scale:**
- H1: 48-64px (Hero headline)
- H2: 32-40px (Section titles)
- H3: 24-28px (Card titles, subtitles)
- Body: 16-18px
- Small: 14px

**Codex Modifiable:**
- Font family selection
- Font weights
- Size scale adjustments

---

### Color System

**Base Palette Structure:**
- Primary color (brand color, CTAs)
- Secondary color (accents)
- Neutral dark (text, headings)
- Neutral light (backgrounds, borders)
- White
- Optional: Accent/highlight color

**Defaults:**
- Text: `#1a1a1a`
- Background: `#ffffff`
- Primary: `#2563eb` (blue, placeholder)
- Secondary: `#64748b` (slate)

**Codex Modifiable:**
- All color values
- Color application (which elements use which colors)

---

### Spacing

**Base Unit:** 4px

**Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

**Section Padding:**
- Default vertical: 64-96px
- Default horizontal: 24px (container max-width: 1280px)

---

### Components

**Buttons:**
- Primary: Filled background, white text
- Secondary: Outlined or ghost
- States: Default, hover, active, disabled

**Cards:**
- Product cards
- Testimonial cards
- Consistent border-radius (8px default)
- Optional shadow

**Inputs:**
- Text input (newsletter email)
- Consistent with button height
- Border style matching overall aesthetic

---

## Responsive Breakpoints

**Desktop-first approach:**

| Breakpoint | Width | Notes |
|------------|-------|-------|
| Desktop (default) | 1280px+ | Full layout |
| Laptop | 1024px | Minor adjustments |
| Tablet | 768px | 2-column grids, stacked sections |
| Mobile | 640px | Single column, hamburger nav |

---

## Interaction & Animation

**Defaults (subtle):**
- Button hover: Slight scale or color shift
- Card hover: Subtle lift (shadow + translateY)
- Scroll: Smooth scroll for anchor links
- Page load: Optional fade-in for sections

**Codex Modifiable:**
- Enable/disable animations
- Animation style (subtle, playful, dramatic)

---

## Image Specifications

**All images are pre-created and available in asset gallery for user selection during onboarding.**

| Image | Dimensions | Aspect Ratio | Quantity in Gallery |
|-------|------------|--------------|---------------------|
| Logo | 200x60 | Variable | 3-5 options |
| Hero backgrounds | 1920x1080 | 16:9 | 5-10 options |
| Product images | 800x800 | 1:1 | 15-20 options |
| About section | 800x600 | 4:3 | 5-10 options |
| Logo placeholder | 200x60 | Variable | Generated from store name |

---

## Video Specifications

**All videos are pre-created and available in asset gallery for user selection during onboarding.**

| Video | Dimensions | Aspect Ratio | Notes |
|-------|------------|--------------|-------|
| Hero video | 1920x1080 | 16:9 | 6-10s, muted loop |
| Product video | 800x800 | 1:1 | 4-8s, muted loop |
| About video | 800x600 | 4:3 | 6-10s, muted loop |

---

## Asset Gallery Categories

**Hero Backgrounds:**
- Minimal lifestyle (neutral tones)
- Bold/dramatic (dark, high contrast)
- Nature/organic (plants, textures)
- Urban/modern (architecture, clean lines)
- Abstract (gradients, shapes)

**Product Images:**
- Home goods (ceramics, textiles, candles)
- Fashion accessories (bags, jewelry)
- Tech/gadgets (minimal product shots)
- Food/beverage (artisan, craft)
- Beauty/wellness (skincare, self-care)

**About Section:**
- Craftsmanship/hands working
- Team/workspace
- Materials/ingredients
- Behind the scenes
- Lifestyle in use

---

## Content Generation (Codex via MCP)

**User provides during onboarding:**
- Brand/store name
- Short narrative/description (1-3 sentences about the brand, vibe, products)
- Selected images from asset gallery

**Codex generates initially:**
- Tagline / headline
- Product names and prices (mocked)
- About section copy
- Testimonial quotes and names
- Navigation labels
- CTA button text
- Full HTML + Tailwind structure

**Codex modifies via chat:**
- Layout changes
- Color palette adjustments
- Typography changes
- Spacing and sizing
- Component arrangement
- Text content refinements
- Style variations (minimal, bold, playful, etc.)

**Iteration flow:**
1. User completes onboarding (brand info + asset selection)
2. Codex generates initial storefront via MCP
3. User sees live preview in editor
4. User chats with Codex: "make it more minimal", "darker color scheme"
5. Codex returns modified HTML via MCP
6. Preview updates instantly
7. Repeat until satisfied
8. Save to dashboard

---

## Technical Notes

## Implementation (Project Setup)

### Stack
- Build tool: Vite
- Styling: Tailwind CSS (configured via `tailwind.config.js` + `postcss.config.js`)
- Framework: Vanilla HTML/CSS/JS (no React)

### Directory Structure
```
/src/
  index.html
  main.js
  styles.css
/assets/
  hero/
  products/
  about/
  backgrounds/
```

### Build / Run
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

### Notes
- All styling via Tailwind CSS utility classes
- HTML structure remains semantic (header, main, section, footer)
- Vanilla JS only for package selection + preview updates
- Images referenced via relative paths under `/asset_packages` (staging)
- Preview rendered in iframe with `srcdoc`

---

## Example Codex Interactions

**Initial Generation (from onboarding):**

User provides:
- Store name: "Ember & Co"
- Narrative: "Handcrafted soy candles made with natural ingredients. Calm, earthy, minimal aesthetic."
- Selected: warm-toned hero image, candle product photos, artisan hands about image

Codex generates:
- Complete HTML + Tailwind storefront
- "Illuminate Your Space" tagline
- Muted earth-tone color palette
- Minimal card styling
- Warm, inviting copy

---

**Customization Chat Examples:**

User: "Make the header sticky"
→ Codex adds `sticky top-0` classes to header

User: "I want a darker, moodier vibe"
→ Codex shifts to dark background, light text, adjusts contrast

User: "Center the hero text and make the headline bigger"
→ Codex updates hero layout and typography classes

User: "The product cards feel too plain, add some hover effects"
→ Codex adds hover:shadow-lg, hover:scale transitions

User: "Change the CTA button to say 'Discover Our Collection'"
→ Codex updates button text

User: "More spacing between sections"
→ Codex increases section padding values

---

## Out of Scope (v1 Demo)

- Shopping cart functionality
- Product detail pages
- Checkout flow
- User accounts for shoppers
- Inventory management
- Payment processing
- Multi-page storefronts
- Custom domain deployment
**Assets (user-selected during onboarding):**
- Logo image from gallery (or text fallback)
**Hero Videos:**
- Minimal lifestyle (subtle movement)
- Bold/dramatic (light play)
- Nature/organic (slow pan)

**Product Videos:**
- 360 turntable
- Slow hands-in-use
- Texture close-ups

**About Videos:**
- Crafting process
- Studio walkthrough
- Lifestyle scene

**Logos:**
  - Wordmarks (text-based)
  - Monogram (iconic initials)
  - Minimal badge
