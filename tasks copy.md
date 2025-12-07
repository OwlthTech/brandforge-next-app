# BrandForge Development Task Plan

Each task includes a **Validation Rule**. All UI and AI-related tasks must:
- Use **ShadCN UI** components for the interface.
- Integrate with **AI SDK** for guideline/brief generation (and later images).
- When relevant, **consult the MCP servers** for ShadCN and AI SDK UI examples before implementation.

MCP servers assumed:
- **shadcn-ui-mcp-server**: exposes ShadCN blocks/components examples.
- **ai-elements**: exposes AI SDK UI integration examples (prompts, flows, UI patterns).

---

## 1. Environment & Tooling Setup

**1.1 Initialize Next.js + TypeScript + App Router project**  
**Validation Rule:** Next.js app (App Router) created with TypeScript enabled; dev server runs and `app/page.tsx` renders a placeholder BrandForge landing page.

**1.2 Configure Tailwind CSS + ShadCN UI**  
**Validation Rule:** Tailwind configured; ShadCN CLI installed and at least core UI components (`button`, `input`, `card`, `dialog`) generated under `components/ui`; sample page renders ShadCN components correctly.

**1.3 Set up AI SDK base config**  
**Validation Rule:** AI SDK dependency installed; `lib/ai/client.ts` created with environment-based configuration; a minimal test route (e.g., `/api/ai/test`) successfully calls AI SDK in dev with a dummy request.

**1.4 Configure TypeScript paths and base linting**  
**Validation Rule:** `tsconfig.json` has path aliases for `@/app`, `@/components`, `@/lib`, `@/types`; lint script runs without fatal errors.

---

## 2. MCP Servers for UI & AI SDK Examples

**2.1 Set up MCP-ShadCN server**  
**Validation Rule:** MCP-ShadCN server is configured and reachable from the dev environment; calling it returns a list of ShadCN blocks/components and at least one example snippet for a layout or form.

**2.2 Set up MCP-AI-SDK-UI server**  
**Validation Rule:** MCP-AI-SDK-UI server is configured and reachable; calling it returns example flows or code snippets showing AI SDK usage in UI (e.g., text generation form, streaming handler).

**2.3 Document MCP usage workflow**  
**Validation Rule:** A short section in `brandforge-react-dev-guide.json` or a dedicated doc describes:
- How to query MCP-ShadCN for component patterns.
- How to query MCP-AI-SDK-UI for AI SDK UI integration examples.
- A checklist to consult MCP examples before building new UI or AI flows.

---

## 3. Data Layer & Persistence (SQLite + UUID)

**3.1 Choose and configure SQLite ORM/adapter (e.g., Drizzle or Prisma)**  
**Validation Rule:** `lib/db/index.ts` exports a connected SQLite client; `npm run db:migrate` (or equivalent) creates a local DB file (e.g., `./data/brandforge.db`).

**3.2 Implement schema for User, Brand, Product, Guideline, Asset, GuidelineHistory**  
**Validation Rule:** `lib/db/schema.ts` defines all tables with UUID primary keys; migration runs successfully and tables exist in SQLite.

**3.3 Implement repository modules**  
**Validation Rule:** `lib/repositories/*.ts` provide CRUD functions for each entity (e.g., `createBrand`, `listBrandsForUser`, `createGuidelineWithHistory`); unit-level calls from a test script successfully read/write records.

**3.4 Local storage helper for transient wizard state**  
**Validation Rule:** `lib/utils/local-storage.ts` (or similar) supports saving/restoring onboarding progress and unsaved forms on the client; manual test confirms wizard resumes after refresh.

---

## 4. Layout, Navigation & Shell (ShadCN)

**4.1 Implement global `app/layout.tsx` and `AppShell`**  
**Validation Rule:** `components/layout/app-shell.tsx` wraps pages with top navigation and (optional) sidebar; uses ShadCN primitives (`sheet`, `button`, `dropdown-menu`, etc.); keyboard navigation works for core controls.

**4.2 Implement Brand switcher component**  
**Validation Rule:** `components/layout/brand-switcher.tsx` displays current brand and allows switching between brands; uses ShadCN `select` or `dropdown-menu`; switching updates route to appropriate Brand Dashboard.

**4.3 Implement global loading & error states**  
**Validation Rule:** `components/common/loading-state.tsx` and `components/common/error-state.tsx` exist and are reused across pages; at least one route demonstrates each state with consistent styling.

Before implementing these, **consult MCP-ShadCN** for layout/dashboard patterns.

---

## 5. Onboarding Flow

**5.1 Onboarding wizard UI**  
**Validation Rule:** `app/onboarding/page.tsx` renders a multi-step wizard using ShadCN components (`tabs` or custom stepper, `card`, `form` controls); user can move between steps, and state persists while within the session.

**5.2 Onboarding: Brand details step**  
**Validation Rule:** `components/onboarding/onboarding-brand-step.tsx` collects brand name, description, industry, colors, logo upload; validation errors shown with clear messages; data stored in local state.

**5.3 Onboarding: Initial products step**  
**Validation Rule:** `components/onboarding/onboarding-products-step.tsx` supports adding/removing multiple products (name, short description, category, tags); uses accessible form elements with clear labels.

**5.4 Onboarding: Summary and persistence**  
**Validation Rule:** `components/onboarding/onboarding-summary-step.tsx` shows a read-only summary; clicking “Finish Onboarding”:
- Creates User (if needed), Brand, and Products in SQLite via API.
- Redirects to the created Brand Dashboard.

Before implementing the wizard UI, **consult MCP-ShadCN** for multi-step form and wizard patterns.

---

## 6. Brand Management

**6.1 Brand list page (`/brands`)**  
**Validation Rule:** `app/brands/page.tsx` lists all brands for current user in ShadCN `card` layout; supports creating a new brand via `brand-form.tsx` in a `dialog` or dedicated page.

**6.2 Brand Dashboard structure**  
**Validation Rule:** `app/brands/[brandId]/page.tsx` uses dedicated components (`brand-dashboard-header`, `brand-products-section`, `brand-assets-section`, `brand-guidelines-section`); data is retrieved from SQLite; loading and empty states are handled.

**6.3 Brand assets CRUD**  
**Validation Rule:** `brand-assets-section.tsx` allows uploading, listing, and deleting brand-level assets (e.g., logos, brand imagery) using `asset-upload-field.tsx`; files are stored under `public/uploads/brands/...`; metadata saved in `Asset` table.

Before building Dashboard layouts and asset cards, **consult MCP-ShadCN** for dashboard and card patterns.

---

## 7. Product Management

**7.1 Product Dashboard UI**  
**Validation Rule:** `app/brands/[brandId]/products/[productId]/page.tsx` composes `product-dashboard-header`, `product-assets-section`, `product-references-section`, `product-guidelines-section`, and `product-generated-assets-section`; all sections load real data or show empty states.

**7.2 Product assets management**  
**Validation Rule:** `product-assets-section.tsx` allows CRUD for product image assets, including angles (`front`, `back`, `side`, etc.); uses ShadCN `card` or gallery components; data persisted as `Asset` records.

**7.3 Design reference assets management**  
**Validation Rule:** `product-references-section.tsx` allows managing design reference assets with optional tags/notes; persisted in `Asset` with `type='design-reference'`.

**7.4 Product metadata editing**  
**Validation Rule:** `product-dashboard-header.tsx` or a dedicated edit form allows editing product metadata (description, category, tags, features, audience segments); changes are persisted.

For gallery layouts and forms, **consult MCP-ShadCN** examples.

---

## 8. Guideline & Design Brief Generation (AI SDK)

**8.1 Guideline data structures and types**  
**Validation Rule:** `types/guideline.ts` defines structured content types (e.g., `BrandGuidelineSections`, `ProductGuidelineSections`); `Guideline.content` in DB stores JSON conforming to these types.

**8.2 Brand guideline editor UI**  
**Validation Rule:** `components/guidelines/guideline-editor.tsx` supports editing named sections (story, voice, palette, etc.) using ShadCN forms; it can be used for both brand and product guidelines via props.

**8.3 Brand guideline generation endpoint**  
**Validation Rule:** `app/api/ai/generate-brand-guideline/route.ts` accepts `{ brandId, guidelineId?, overrides }`, gathers brand context from DB, calls AI SDK through `lib/ai/client.ts` and `brand-guideline` prompt, and returns structured sections; basic error handling and logging implemented.

**8.4 Product guideline generation endpoint**  
**Validation Rule:** `app/api/ai/generate-product-guideline/route.ts` accepts `{ brandId, productId, guidelineId?, overrides }`, gathers brand + product + reference assets, calls AI SDK with `product-guideline` prompt, and returns structured sections.

**8.5 Guideline save & versioning**  
**Validation Rule:** API and repository functions create/update `Guideline` and append entries in `GuidelineHistory`; editor UI can display a simple version timeline using `guideline-history-timeline.tsx`.

**8.6 Wire AI SDK into editors**  
**Validation Rule:** From Brand/Product Guideline Editor pages, a “Generate with AI” button triggers the respective AI endpoint, populates sections, and allows manual refinement before saving; errors are displayed via ShadCN `alert`.

Before implementing prompts and editor UX:
- **Consult MCP-AI-SDK-UI** for example prompt patterns and streaming UI.
- **Consult MCP-ShadCN** for text editor and form layout patterns.

---

## 9. Asset Generation & Editing (Structural MVP)

**9.1 Asset generation layout shell**  
**Validation Rule:** `components/assets/asset-generation-layout.tsx` provides common layout for `/assets/generate/*` pages with side panel (inputs), main preview, and optional edit panel; uses ShadCN layout components.

**9.2 Configure per-type generation pages**  
**Validation Rule:** Pages for `marketplace`, `social`, `banner`, `icons`, `custom` render with shared layout and type-specific default settings (preset aspect ratios, platforms); settings saved in local component state.

**9.3 Wire guideline and product selection**  
**Validation Rule:** From an Asset Generation page, the user can pick Brand, Product, and Guideline from ShadCN `select` components; selections are reflected in query state.

**9.4 Draft image generation (stub with AI SDK)**  
**Validation Rule:** `app/api/ai/generate-image/route.ts` exists with a basic implementation that, at minimum, returns placeholder image URLs or a simulated response; UI correctly displays generated previews in `asset-gallery.tsx`.

**9.5 High-quality re-generation and edit instruction flow (design only if not fully implemented)**  
**Validation Rule:** UI allows selecting draft images and choosing actions: “Re-generate high quality” and “Edit with instructions”; API routes are stubbed (`/api/ai/edit-image`) and invoked, even if they return mocked data for the first phase.

Before implementing, **consult both MCP-ShadCN** (for gallery/preview patterns) and **MCP-AI-SDK-UI** (for multi-step AI flows and status handling).

---

## 10. Settings, Export/Import & Local-First Concerns

**10.1 Settings page UI**  
**Validation Rule:** `app/settings/page.tsx` shows basic user profile info (local), database location info, and buttons for export/import/reset; uses ShadCN `card`, `button`, and `alert` for confirmations.

**10.2 Data export endpoint**  
**Validation Rule:** `app/api/export/route.ts` returns a JSON blob containing brands, products, guidelines, and asset metadata for the current user; confirmed with a manual export test.

**10.3 Data import endpoint**  
**Validation Rule:** `app/api/import/route.ts` accepts the export format, validates it, and imports data into SQLite; errors are reported via structured responses.

**10.4 Local-first performance checks**  
**Validation Rule:** With a seeded dataset (e.g., 20 brands, 100 products, 500 assets), core pages still load in an acceptable time; if needed, pagination or virtualized lists are enabled.

---

## 11. Accessibility & UX Polish

**11.1 Keyboard navigation and focus management**  
**Validation Rule:** Core flows (onboarding, dashboards, editors) can be completed via keyboard only; focus states are visible; `accessibility.ts` helpers applied where needed.

**11.2 ARIA and semantic markup**  
**Validation Rule:** Landmark regions (nav, main, header) and interactive elements use appropriate ARIA attributes and roles; spot-checked with browser accessibility tools.

**11.3 Copy and microcopy review**  
**Validation Rule:** All text uses clear, non-technical language suited to non-technical users; destructive actions include explicit confirmation text.

Before UX polish, **consult MCP-ShadCN** for accessible component usage guidance.

---

## 12. Authentication (Later Phase)

**12.1 Local profile-based pseudo-auth**  
**Validation Rule:** A minimal profile selector (or login/register) exists; switching profiles changes the active `userId` and associated data scope; no external auth provider yet.

**12.2 Plan for real auth integration**  
**Validation Rule:** A short note in `architecture.md` or dev guide outlines a future integration (e.g., NextAuth/Auth.js) using existing UUID-based IDs and DB schema.

---

This task plan is structured so that:
- Core local-first data and dashboards can ship early.
- AI SDK-based guideline generation is integrated cleanly.
- ShadCN UI is consistently used across the app.
- MCP servers for ShadCN and AI SDK UI examples are part of the normal development workflow for any UI/AI feature.