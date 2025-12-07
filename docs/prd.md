# BrandForge Project Requirements Document (PRD)

## Goal
BrandForge is a local-first, highly accessible application that helps non-technical users manage multiple brands and products and create consistent media assets and guidelines. It focuses initially on structured design briefs and brand/product guidelines, with optional image generation flows that support fast preview and higher-quality re-generation. The app should enable a single user to manage multiple brands, each with multiple products, and to centralize the management of brand assets, product assets, and generated guidelines in an intuitive, low-friction interface.

## Features

### User & Account (MVP, light, auth later)
- Local-first account representation using UUID-based `userId`.
- Simple “Create account” and “Login” flows, initially backed by local storage / SQLite, with the authentication mechanics implemented after the core data model and persistence are stable.
- Onboarding experience triggered after first login or first brand creation.

### Onboarding Flow
- Guided, multi-step onboarding wizard for low-technical users:
  - Step 1: Collect comprehensive **Business/Brand Details**:
    - Basic: brand name, description, industry, base colors
    - Extended: website URL, Google My Business URL, social media URLs
    - Assets: logo upload, branded image assets, reference/inspiration images
  - Step 2: Collect an initial **List of Products** for the brand (name, short description, category, basic attributes).
  - Step 3: Summary review with all collected information
- Enhanced progress indication with animated step indicators showing completion status
- Clear next/back actions, autosave to local storage/SQLite
- Responsive design with improved file upload components (drag-and-drop support)
- Contextual help text and tooltips to explain design/branding terms
- Flexible redirect behavior: returns to brand list or new brand dashboard based on entry point

### Brand Management
- Support for **multiple brands** per user.
- **Brand Dashboard** for each brand, with:
  - Overview of brand basics (name, description, key colors, primary logo, URLs).
  - **Section: Products DataTable** with advanced features:
    - Checkboxes for bulk selection and actions
    - Search and filter by category/tags
    - Thumbnail images, name, category, description, tags display
    - Bulk delete functionality
    - Individual row actions (view, delete)
  - **Section: Enhanced Brand Assets Grid**:
    - Square aspect-ratio layout for consistent presentation
    - Image hover effects with overlay controls
    - Dropdown menu with view (lightbox) and delete actions
    - Support for multiple asset types: logo, branded-asset, inspiration-image
    - Notes field for inspiration/reference images
  - **Section: Brand Guidelines** with field-level AI regeneration.
  - **Actions:**
    - Add/edit/delete brand-level assets with improved file upload UX.
    - Generate/Edit **Brand Guideline** with AI-powered field regeneration.
- Easy brand switcher to move between brands.

### Product Management
- Support for **multiple products** per brand.
- **Product Dashboard** for each product:
  - **Product basics:** name, description, category, tags, and key attributes (features, benefits, audience tags).
  - **Section: Product Assets**
    - List and manage product images by type: raw-product-image, product-image, inspiration-image.
    - Enhanced file upload with drag-and-drop support and image previews.
    - CRUD operations for product assets (add, replace, delete).
  - **Section: Design Reference Assets**
    - Reference/inspiration images with notes field for context.
    - Multi-file upload support with individual notes per image.
    - CRUD operations with enhanced UX.
  - **Section: Generated Assets & Guidelines**
    - List of generated **Product Guidelines / Design Briefs** with field-level AI regeneration.
    - List of generated media assets (images), once image generation is integrated.
    - Filters by asset type (Marketplace image, Social post, Website banner, Icons, Custom) and status (draft, approved, needs revision).
  - **Actions:**
    - Generate/Edit **Product Guideline / Design Brief** with AI-powered field regeneration.
    - Upload raw product images (HD, non-creative) during product creation.
    - Upload external inspiration images with notes during product creation.
    - Generate media assets (once image generation is active) using selected guideline + settings.

### Guideline & Design Brief Generation (AI-focused MVP)
- AI-powered generation of:
  - **Brand Guidelines / Design Briefs**: structure covering brand story, voice, palette, typography, audience, use cases.
  - **Product Guidelines / Design Briefs**: structure covering positioning, key visuals, tone, do/don't examples, channel-specific recommendations.
- **Field-level AI Regeneration**:
  - RegenerableTextarea component allows regenerating individual fields (mission, vision, values, etc.).
  - Context-aware prompts specific to each section and field.
  - Token-efficient approach regenerating only necessary fields.
  - Maintains brand context while allowing targeted improvements.
- Editable structured editor with manual refinement capabilities.
- Versioning with timestamps and user-created custom titles.
- Save guidelines as reusable **presets** to drive later image generation flows.
- History timeline showing all past versions with left-aligned display.

### Asset Generation (visual, phase 1 focus is structure, with images optional)
- Define and support **asset types**:
  - Marketplace Image
  - Social Media Image
  - Website Banner
  - Icons
  - Custom
- Each asset type maps to a dedicated generation page or mode with pre-configured defaults based on:
  - Selected brand & product
  - Selected guideline/brief
  - Target platform or use case (e.g., “Amazon listing main image”, “Instagram square post”).
- **Hybrid image workflow (MVP behavior):**
  - Fast draft generation (lower quality or smaller size) for preview.
  - Optional “Re-generate as high-quality” for selected images.
- Image editing style interaction:
  - Given a generated image, user can issue **edit instructions** (“make background lighter”, “zoom in on product”, “change text to X”) that modify the existing image rather than regenerating from scratch.
- Initially, image generation may be treated as **optional / pluggable**, with clear structure planned but implementation possibly staged after guideline generation.

### Navigation & Usability
- Global navigation tailored to non-technical users:
  - Home / Brand List
  - Active Brand Dashboard
  - Active Product Dashboard
  - Asset Generation pages
  - Settings / Account (simple for MVP)
- Strong accessibility:
  - Keyboard-accessible flows.
  - Clear labels, high-contrast themes, and large-click targets.
  - Descriptive error & success messages.
- Undo/confirm patterns for destructive actions (delete assets, delete brands/products).

### Persistence & Local-First Behavior
- Use **SQLite or local storage** for development environment persistence.
- Persist: users, brands, products, assets metadata, guidelines, generation histories.
- Use **UUID** for primary IDs (e.g., `userId`, `brandId`, `productId`, `assetId`).

### Future-Ready (Cloud/Production)
- Design entities, routes, and APIs so migration from local-only to cloud deployment (e.g., Vercel + hosted DB) is straightforward.
- Authentication, multi-user support, and collaboration to be added after MVP, using the existing UUID model as a base.

## Pages/Screens/Routes and Content

> High-level; final routing will be refined in the architecture phase to align with NextJS App Router directory structure.

### Auth & Entry
- **Landing / Welcome**
  - Simple description of BrandForge.
  - CTA: “Create account” / “Continue” and “Login” (even if initially mapped to local profile creation).
- **Create Account**
  - Minimal fields (name, email or local username, optional password if implemented).
  - Generates UUID-based `userId`.
- **Login**
  - For later production auth; in MVP/dev environment, can be simplified (e.g., select a local profile).

### Onboarding Wizard (`/onboarding`)
- Step 1: Business/Brand Details
  - Inputs: brand name, description, industry, base colors, fonts (optional), logo upload.
- Step 2: Add Initial Products
  - Simple list builder: product name, short description, category, tags.
- Summary: Review and “Finish Onboarding” → redirect to Brand Dashboard.

### Brand List / Home (`/brands`)
- List of existing brands (cards).
- Actions: “Create new brand”, “Open Brand Dashboard”.
- Basic stats: # of products, # of guidelines, # of generated assets.

### Brand Dashboard (`/brands/[brandId]`)
- Header with brand identity summary.
- Section: Product List
  - Paginated datatable of products with quick actions (open product, edit product, add new product).
- Section: Brand Assets
  - Logos, brand images, mood/inspiration boards; actions to upload, edit, delete.
- Section: Brand Guidelines / Design Briefs
  - List of generated brand guidelines; statuses; “Create New Guideline” and “Edit” actions.

### Brand Guideline Editor
- `/brands/[brandId]/guidelines/new`
- `/brands/[brandId]/guidelines/[guidelineId]`
- Structured editor showing sections (brand story, voice, palette, etc.).
- Button to “Generate using AI” (using existing brand data & references).
- Ability to manually edit any section and save.
- Version or history panel (e.g., last 5 versions).

### Product Dashboard (`/brands/[brandId]/products/[productId]`)
- Header with product basics and brand badge.
- Section: Product Assets
  - Grid/list of product images by angle/type; CRUD operations.
- Section: Design Reference Assets
  - Reference/inspiration images with tags and notes; CRU(D) operations.
- Section: Product Guidelines / Design Briefs
  - List of generated guidelines for this product; actions to create new or edit.
- Section: Generated Assets for this Product
  - Gallery of generated images and variants, with filters by asset type and status.

### Product Guideline Editor
- `/brands/[brandId]/products/[productId]/guidelines/new`
- `/brands/[brandId]/products/[productId]/guidelines/[guidelineId]`
- Similar to brand guideline editor but tailored to product-specific content.
- “Generate using AI” using brand guideline + product metadata + design references.

### Asset Generation Flows (per type)
- `/assets/generate/marketplace`
- `/assets/generate/social`
- `/assets/generate/banner`
- `/assets/generate/icons`
- `/assets/generate/custom`

Common layout for all asset generation pages:
- Side panel for inputs and settings (brand/product selection, guideline selection, target platform, aspect ratio, style presets).
- Center/preview area to display generated images (initially can show placeholders or imported images before full AI integration).
- Advanced settings panel (prompt tweaks, negative prompts, reference strength, etc.) for later AI integration.
- Controls to:
  - Generate draft images.
  - Select images and request “High-quality re-generation”.
  - Issue **edit instructions** to modify a selected generated image without restarting from scratch.

### Settings & Account (`/settings`)
- Simple profile data (for MVP).
- Local storage management tools (e.g., export/import data, reset app data).

## Full User Workflow Story Steps

### 1. First-Time User (Onboarding)
1. User opens BrandForge and lands on a Welcome screen.
2. User creates a local account (UUID assigned) and is redirected into the onboarding wizard.
3. In Step 1, user enters brand name, short description, selects industry, uploads logo, and picks colors.
4. In Step 2, user adds several initial products with names and short descriptions.
5. User reviews the summary and clicks “Finish Onboarding”.
6. User lands on the **Brand Dashboard** for their first brand.

### 2. Managing Brand & Products
1. From the Brand Dashboard, user sees the list of products and clicks a product card to open the Product Dashboard.
2. On the Product Dashboard, user uploads product images (front/back/side) and a few inspiration/reference images.
3. User adds or edits product metadata (tags, features, target audience).
4. User returns to Brand Dashboard, uploads additional brand imagery, and confirms core brand details.

### 3. Generating Brand Guidelines (Design Brief)
1. From the Brand Dashboard, user clicks “Generate Brand Guideline”.
2. User reviews pre-filled brand details and optional reference images.
3. User clicks “Generate with AI”.
4. System produces a structured brand guideline (story, voice, colors, do/don’t, etc.).
5. User reviews, edits sections in an editor, and saves the guideline.
6. Saved guideline appears in the Brand Guidelines list and is referenced by product-level flows.

### 4. Generating Product Guidelines (Design Brief)
1. From the Product Dashboard, user clicks “Generate Product Guideline / Brief”.
2. The system pre-selects the associated brand, brand guideline, product metadata, and reference images.
3. User optionally adjusts brief settings (primary channel, tone emphasis, use-case focus).
4. User triggers AI generation; a structured product guideline is produced.
5. User refines text in the editor and saves the guideline as a reusable preset.

### 5. Asset Generation & Editing (Hybrid Flow)
1. From the Product Dashboard or a global “Create Asset” button, user chooses an asset type (e.g., Marketplace Image).
2. System navigates to the corresponding asset generation page with brand, product, and guideline pre-selected.
3. User tweaks settings (platform, aspect ratio, layout hints, overlays).
4. User clicks “Generate Draft”.
5. System returns a set of preview images (draft quality) in the preview area.
6. User selects 1–2 promising images and requests “High-quality regenerate”.
7. System generates higher-quality versions and replaces or adds them to the gallery.
8. For a selected image, user types an edit instruction (e.g., “remove text overlay” or “make background pure white”).
9. System applies an edit to the existing image and returns a modified version while preserving association with the original.
10. User saves/exports selected assets and returns to the Product Dashboard, where generated assets now appear in the “Generated Assets” section.

### 6. Returning Sessions & Multi-Brand Management
1. On subsequent app launches, user arrives on Brand List or the last active brand.
2. User selects a brand from the Brand List and sees its dashboard, with counts of products, guidelines, and generated assets.
3. User can create new brands, onboard them with their own products, and repeat the above flows for each brand.

## Key Considerations

### Accessibility & UX
- Interface must be usable by low-technical users: friendly language, clear icons with labels, guided flows, and helpful defaults.
- Full keyboard navigation, ARIA roles, and high-contrast themes for critical screens.
- Avoid overly technical AI terminology; use everyday language (“Improve image”, “Make colors softer”, etc.).

### Performance & Responsiveness
- Local-first data operations (SQLite / local storage) should be fast, with responsive UI that clearly indicates loading and generation states.
- Asset galleries should be virtualized or paginated to avoid performance degradation with many assets.

### Data Integrity & Versioning
- Ensure guidelines (brand and product) are versioned or at least keep basic history (e.g., last N versions).
- Maintain clean relationships: user → brands → products → assets/guidelines.
- Use UUIDs consistently across all entities.

### AI Integration
- Use AI SDK for guideline/brief generation, with an interface that can be extended later for image generation (use cheapest model for testing).
- Clearly separate:
  - Text guideline generation.
  - Image generation and editing operations.
- Log prompts and responses minimally (locally) for debugging and iteration, taking care with PII where applicable.

### Security & Privacy (for local-first MVP)
- Since the first deployment is local-only/desktop-style, security is simpler but:
  - Avoid storing sensitive data unencrypted if not required.
  - Design with an eye toward future multi-user and cloud deployments.

### Scalability & Future Cloud Migration
- Design the schema and application boundaries such that moving from local SQLite/local storage to a cloud database is straightforward.
- Keep business logic in a form that can run on server-side later, not tightly coupled to client-only assumptions.
