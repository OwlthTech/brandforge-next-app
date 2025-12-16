# BrandForge Application Architecture

## Overview

BrandForge is a local-first, desktop-friendly web application built with **Next.js (App Router)**, **ShadCN UI**, **AI SDK**, and **SQLite/local storage** for persistence. The architecture is designed to:

- Support a **single user managing multiple brands and products**.
- Provide **highly accessible CRUD dashboards** for brands, products, assets, and guidelines.
- Enable **AI-powered guideline/brief generation** (brand + product) in Phase 1, with a clear path to **pluggable image generation/editing**.
- Start as **local-first** (SQLite/local storage) with a straightforward migration path to a cloud deployment (e.g., Vercel + hosted DB).

---

## Directory & File System Structure

High-level Next.js (App Router) project structure:

```text
brandforge/
  app/
    layout.tsx
    page.tsx                      # Landing / Welcome

    onboarding/
      page.tsx                    # Onboarding wizard (multi-step)

    brands/
      page.tsx                    # Brand list / home
      [brandId]/
        page.tsx                  # Brand dashboard
        guidelines/
          new/
            page.tsx              # Create brand guideline
          [guidelineId]/
            page.tsx              # View/Edit brand guideline
        products/
          [productId]/
            page.tsx              # Product dashboard
            guidelines/
              new/
                page.tsx          # Create product guideline
              [guidelineId]/
                page.tsx          # View/Edit product guideline

    assets/
      generate/
        marketplace/
          page.tsx
        social/
          page.tsx
        banner/
          page.tsx
        icons/
          page.tsx
        custom/
          page.tsx

    settings/
      page.tsx                    # Basic settings, data management

    api/
      ai/
        generate-brand-guideline/route.ts
        generate-product-guideline/route.ts
        generate-image/route.ts                # placeholder/pluggable
        edit-image/route.ts                    # placeholder/pluggable
      brands/
        route.ts                               # POST/GET for list/create
        [brandId]/
          route.ts                             # GET/PATCH/DELETE brand
          products/
            route.ts                           # POST/GET products for brand
          guidelines/
            route.ts                           # POST/GET brand guidelines
      products/
        [productId]/
          route.ts                             # GET/PATCH/DELETE product
          guidelines/
            route.ts                           # POST/GET product guidelines
          assets/
            route.ts                           # POST/GET product assets

  components/
    ui/                                       # ShadCN UI primitives
      button.tsx
      input.tsx
      textarea.tsx
      select.tsx
      dialog.tsx
      dropdown-menu.tsx
      sheet.tsx
      tabs.tsx
      card.tsx
      breadcrumb.tsx
      pagination.tsx
      alert.tsx
      badge.tsx
      tooltip.tsx
      skeleton.tsx
      scroll-area.tsx
      switch.tsx
      checkbox.tsx                            # ✓ Implemented
      table.tsx                               # ✓ Implemented
      label.tsx
      field.tsx                               # ✓ Implemented (shadcn field)
      loader.tsx                              # ✓ Implemented (custom with variants)
      file-upload.tsx                         # ✓ Implemented (drag-drop support)
      regenerable-textarea.tsx                # ✓ Implemented (AI field regeneration)

    layout/
      app-shell.tsx                           # Main shell layout, nav, sidebar
      app-sidebar.tsx                         # ✓ Implemented
      top-nav.tsx
      brand-switcher.tsx                      # ✓ Implemented
      nav-main.tsx                            # ✓ Implemented
      nav-projects.tsx                        # ✓ Implemented
      nav-user.tsx                            # ✓ Implemented

    onboarding/
      onboarding-brand-step.tsx               # ✓ Implemented with enhanced fields
      onboarding-products-step.tsx            # ✓ Implemented
      onboarding-summary-step.tsx             # ✓ Implemented

    brand/
      brand-dashboard-header.tsx              # ✓ Implemented
      brand-products-section.tsx              # ✓ Implemented with DataTable
      brand-assets-section.tsx                # ✓ Implemented with enhanced grid
      brand-guidelines-section.tsx            # ✓ Implemented

    product/
      product-dashboard-header.tsx            # ✓ Implemented
      product-assets-section.tsx              # ✓ Implemented
      product-references-section.tsx          # ✓ Implemented
      product-guidelines-section.tsx          # ✓ Implemented
      products-data-table.tsx                 # ✓ Implemented (with filters & bulk actions)

    guidelines/
      guideline-editor.tsx                    # ✓ Implemented with RegenerableTextarea
      guideline-history-timeline.tsx          # ✓ Implemented with timestamps

    assets/
      asset-generation-layout.tsx
      asset-filters-bar.tsx
      asset-gallery.tsx
      asset-preview-panel.tsx
      asset-edit-instructions-panel.tsx

    forms/
      brand-form.tsx
      product-form.tsx
      asset-upload-field.tsx

    common/
      empty-state.tsx                         # ✓ Implemented
      loading-state.tsx                       # ✓ Implemented with new Loader
      ai-loading-state.tsx                    # ✓ Implemented
      error-state.tsx                         # ✓ Implemented

    lib/
      actions/                       # Server Actions (Mutations)
        __tests__/                   # Unit tests (Vitest)
        asset-actions.ts
        brand-actions.ts
        guideline-actions.ts
        product-actions.ts

      dal/                           # Data Access Layer
        auth.ts

      db/                            # Database Configuration
        index.ts
        schema.ts
        
      repositories/                  # Database Operations
        user-repo.ts
        brand-repo.ts
        product-repo.ts
        guideline-repo.ts
        asset-repo.ts

      ai/                            # AI SDK Integration
        client.ts
        prompts/
        mappers/

      utils/                         # Helpers
        uuid.ts
        validation.ts
        accessibility.ts
        pagination.ts
        file-storage.ts

  types/
    brand.ts
    product.ts
    guideline.ts
    asset.ts
    user.ts

  public/
    images/
      logo.svg
      placeholders/
        brand-placeholder.png
        product-placeholder.png

  styles/
    globals.css
    theme.css                                 # Tailwind + ShadCN tokens

  brandforge-react-dev-guide.json             # Dev guide / meta
  prd.md
  architecture.md
  tasks.md (later)
```

---

## Data Model & Persistence

### Entities & Relationships

- `User`
  - `id: string` (UUID)
  - `name: string`
  - `email?: string`
  - `createdAt: Date`

- `Brand`
  - `id: string` (UUID)
  - `userId: string` (FK → User)
  - `name: string`
  - `description?: string`
  - `industry?: string`
  - `primaryColor?: string`
  - `secondaryColor?: string`
  - `fontFamily?: string`
  - `logoAssetId?: string` (FK → Asset)
  - `createdAt: Date`
  - `updatedAt: Date`

- `Product`
  - `id: string` (UUID)
  - `brandId: string` (FK → Brand)
  - `name: string`
  - `description?: string`
  - `category?: string`
  - `tags: string[]` (stored as JSON)
  - `features?: string[]` (JSON)
  - `benefits?: string[]` (JSON)
  - `audienceSegments?: string[]` (JSON)
  - `createdAt: Date`
  - `updatedAt: Date`

- `Guideline`
  - `id: string` (UUID)
  - `brandId: string` (FK → Brand)
  - `productId?: string` (FK → Product, nullable for brand-level guidelines)
  - `type: 'brand' | 'product'`
  - `title: string`
  - `content: object` (structured JSON: sections like story, voice, palette, etc.)
  - `version: number`
  - `status: 'draft' | 'final'`
  - `createdAt: Date`
  - `updatedAt: Date`

- `Asset`
  - `id: string` (UUID)
  - `brandId: string` (FK → Brand)
  - `productId?: string` (FK → Product)
  - `type: 'brand-image' | 'product-image' | 'design-reference' | 'generated-asset' | 'logo'`
  - `subtype?: 'front' | 'back' | 'side' | 'angled' | 'detail' | 'banner' | 'marketplace' | 'social' | 'icon' | 'custom'`
  - `filePath: string` (local path or URL)
  - `altText?: string`
  - `metadata: object` (JSON: size, format, orientation, platform, etc.)
  - `createdFromGuidelineId?: string` (FK → Guideline)
  - `status?: 'draft' | 'approved' | 'needs-revision'`
  - `createdAt: Date`
  - `updatedAt: Date`

- `GuidelineHistory`
  - `id: string` (UUID)
  - `guidelineId: string` (FK → Guideline)
  - `version: number`
  - `content: object` (snapshot of guideline at that version)
  - `createdAt: Date`

All IDs are UUID strings, aligned with the requirement to use UUIDs as primary keys (e.g., `userId`).

### SQLite / Local Storage Strategy

- **Primary store** (recommended): SQLite database accessed via a Node-friendly adapter (e.g., Drizzle or Prisma with SQLite provider).
  - Lives in a local file during development (e.g., `./data/brandforge.db`).
  - `lib/db/index.ts` exposes a single DB client instance.
  - `lib/db/schema.ts` defines schema and relations.
- **Secondary/local storage**:
  - For lightweight client-side state (wizard progress, unsaved form data) use `localStorage` or `IndexedDB` via a thin abstraction.
  - All canonical data (brands, products, guidelines, assets) is persisted in SQLite.

This design is local-first and easily migrated to a hosted SQLite or relational DB later.

---

## Application Routes / Pages (App Router)

The following maps PRD pages to Next.js App Router segments.

- **Landing / Welcome**
  - `app/page.tsx`

- **Auth (MVP local profile)**
  - (Optional) `app/login/page.tsx`
  - (Optional) `app/register/page.tsx`
  - In the local-first phase, these can be simple selectors or forms backed by SQLite.

- **Onboarding Wizard**
  - `app/onboarding/page.tsx`
  - Internally uses steps managed by client state/context and persisted drafts via localStorage/SQLite.

- **Brand List / Home**
  - `app/brands/page.tsx`

- **Brand Dashboard**
  - `app/brands/[brandId]/page.tsx`

- **Brand Guideline Editor**
  - `app/brands/[brandId]/guidelines/new/page.tsx`
  - `app/brands/[brandId]/guidelines/[guidelineId]/page.tsx`

- **Product Dashboard**
  - `app/brands/[brandId]/products/[productId]/page.tsx`

- **Product Guideline Editor**
  - `app/brands/[brandId]/products/[productId]/guidelines/new/page.tsx`
  - `app/brands/[brandId]/products/[productId]/guidelines/[guidelineId]/page.tsx`

- **Asset Generation Pages**
  - `app/assets/generate/marketplace/page.tsx`
  - `app/assets/generate/social/page.tsx`
  - `app/assets/generate/banner/page.tsx`
  - `app/assets/generate/icons/page.tsx`
  - `app/assets/generate/custom/page.tsx`

- **Settings / Account**
  - `app/settings/page.tsx`

Each route uses shared layout components (`app/layout.tsx`, `components/layout/app-shell.tsx`) for navigation, brand switcher, and consistent theming.

---

## API Endpoints

All API routes are implemented using Next.js App Router `route.ts` files.

### AI-related

- `POST /api/ai/generate-brand-guideline`
  - **Payload:** `{ brandId: string, guidelineId?: string, overrides?: { tone?: string; audience?: string[]; primaryChannel?: string } }`
  - **Behavior:**
    - Load brand + relevant assets.
    - Call AI SDK with a prompt template (`lib/ai/prompts/brand-guideline.ts`).
    - Return structured sections for guideline.

- `POST /api/ai/regenerate-field` **✓ Implemented**
  - **Payload:** `{ brandId: string, section: string, field: string, currentValue: string, brandContext: object }`
  - **Behavior:**
    - Context-aware field regeneration for individual guideline fields.
    - Section-specific prompts (story.mission, story.vision, etc.).
    - Returns plain text replacement value.
    - Token-efficient single-field updates.

- `POST /api/ai/generate-product-guideline`
  - **Payload:** `{ brandId: string, productId: string, guidelineId?: string, overrides?: { primaryChannel?: string; tone?: string; focus?: string } }`
  - **Behavior:**
    - Load brand guideline, product metadata, references.
    - Call AI SDK with prompt template (`lib/ai/prompts/product-guideline.ts`).
    - Return structured product guideline sections.

- `POST /api/ai/generate-image` (placeholder, future)
  - **Payload:** `{ brandId, productId?, guidelineId?, type, settings, references }`
  - Returns draft image URLs/paths.

- `POST /api/ai/edit-image` (placeholder, future)
  - **Payload:** `{ assetId, instructions }`
  - Applies edit to an existing generated asset and returns an updated version.

### Brand Management

- `GET /api/brands`
  - Query brands for current user.

- `POST /api/brands`
  - Create a new brand from onboarding or brand form.

- `GET /api/brands/[brandId]`
  - Fetch brand, counts of products, guidelines, and assets.

- `PATCH /api/brands/[brandId]`
  - Update brand details.

- `DELETE /api/brands/[brandId]`
  - Soft or hard delete brand (consider soft delete for safety).

### Product Management

- `GET /api/brands/[brandId]/products`
  - List products for brand.

- `POST /api/brands/[brandId]/products`
  - Create new product for brand.

- `GET /api/products/[productId]`
  - Fetch product details and related counts.

- `PATCH /api/products/[productId]`
  - Update product.

- `DELETE /api/products/[productId]`
  - Delete product (with safety checks if referenced by guidelines/assets).

### Guideline Management

- `GET /api/brands/[brandId]/guidelines`
  - List brand-level guidelines.

- `POST /api/brands/[brandId]/guidelines`
  - Create a new brand guideline (from manual edit or AI result).

- `GET /api/guidelines/[guidelineId]`
  - Fetch guideline with latest content and history.

- `PATCH /api/guidelines/[guidelineId]`
  - Update guideline content, bump version, and log history.

- `GET /api/products/[productId]/guidelines`
  - List product-level guidelines.

- `POST /api/products/[productId]/guidelines`
  - Create new product guideline.

### Asset Management

- `POST /api/upload` **✓ Implemented**
  - Upload files for brands/products with support for multiple asset types.
  - Supports: logo, branded-asset, inspiration-image, raw-product-image.
  - Returns file path and metadata.

- `GET /api/products/[productId]/assets`
  - List product assets (all types) with filters.

- `POST /api/products/[productId]/assets` **✓ Implemented**
  - Upload or link product asset, design reference, or generated asset.
  - Supports notes field for inspiration images.

- `GET /api/assets?brandId=[brandId]` **✓ Implemented**
  - List assets for a brand with type filtering.

- `POST /api/assets` **✓ Implemented**
  - Create asset record with enhanced metadata.
  - Supports: name, url/filePath, notes, type.

- `PATCH /api/assets/[assetId]`
  - Update asset metadata (e.g., status, alt text).

- `DELETE /api/assets/[assetId]` **✓ Implemented**
  - Delete asset.

### Utility / Settings

- `POST /api/export`
  - Export user’s data (brands, products, guidelines, assets metadata) for backup.

- `POST /api/import`
  - Import previously exported data.

---

## ShadCN UI Usage

ShadCN UI components will be the base for the interface, with a focus on accessibility:

- **Global building blocks:** `button`, `input`, `textarea`, `select`, `dialog`, `card`, `tabs`, `alert`, `badge`, `tooltip`, `scroll-area`, `skeleton`, `pagination`, `breadcrumb`.
- **Layouts:**
  - `app-shell` using ShadCN `sheet`, `sidebar`, `top-nav` patterns.
  - Responsive layout: sidebar for navigation (brands, products, assets) and main content area.
- **Data-heavy sections:**
  - Use `card`, `table` or list views (`scroll-area`) for brand/product lists and galleries.
  - Use `tabs` for switching between sections (e.g., Assets, Guidelines, Settings) within dashboards.
- **Forms & Wizards:**
  - Build onboarding and guideline editors with ShadCN `form`, `input`, `select`, `textarea`, plus `dialog` for confirmations.

All custom components (`brand-dashboard-*`, `product-*`, `asset-*`, `guideline-*`) compose ShadCN primitives to keep styling consistent and accessible.

---

## AI SDK Integration

AI SDK integration is encapsulated in `lib/ai`:

- `lib/ai/client.ts`
  - Initializes AI SDK client with API key/env variables.
  - Provides helpers like `generateBrandGuideline(payload)`, `generateProductGuideline(payload)`, `generateImage(payload)`, `editImage(payload)`.

- `lib/ai/prompts/brand-guideline.ts`
  - Defines prompt templates for brand guideline generation.
  - Assembles structured context (brand details, assets, existing guidelines) into a single request.

- `lib/ai/prompts/product-guideline.ts`
  - Templates tuned to product guidelines and channel-specific recommendations.

- `lib/ai/mappers/guideline-mapper.ts`
  - Functions to map DB entities → AI input and AI output → `Guideline.content` structure.

API routes under `/api/ai/*` call into these helpers, keeping prompts and SDK wiring separate from HTTP concerns.

---

## Utilities / Libs

Key utility modules:

- `lib/utils/uuid.ts`
  - Wrapper for a UUID library; ensures all generated IDs use a consistent version.

- `lib/utils/validation.ts`
  - Zod/Yup schemas for API request validation (brands, products, guidelines, assets).

- `lib/utils/accessibility.ts`
  - Helpers for ARIA attributes, focus management, and keyboard shortcuts across forms and dialogs.

- `lib/utils/pagination.ts`
  - Shared pagination logic for listing brands, products, guidelines, and assets.

- `lib/utils/file-storage.ts`
  - For local dev: maps uploaded files to a local directory under `public/uploads/...`, returns file paths.
  - Provides stubs for migration to cloud storage later.

---

## Security & Testing

### Organization Access Control
- **Server Actions:** All mutations (`create`, `update`, `delete`) in `lib/actions/*` enforce strict organization-level isolation.
- **Verification:** Before performing any action on a Brand or its child entities (Products, Assets, Guidelines), the system:
  1. Retrieves `organization_id` from the secure session cookie.
  2. Verifies that the target Brand belongs to that `organization_id`.
  3. Throws an `Unauthorized` error if the check fails.

### Testing Strategy
- **Framework:** Vitest with React Testing Library and JSDOM.
- **Unit Tests:** Located in `__tests__` directories alongside source files (e.g., `src/lib/actions/__tests__`).
- **Mocking:**
  - `lib/db`: Mocked to prevent real database connections during tests.
  - `lib/dal/auth`: Mocked authentication checks.
  - `server-only`: Mocked to allow server actions to be tested in the Vitest environment.

---

## Local-First & Future Cloud Migration

- **Local-first:**
  - SQLite DB in local file accessed via server components / route handlers.
  - File uploads saved to `public/uploads` or a similar local directory.
- **Cloud-ready:**
  - DB access is behind `lib/db` and repositories; switching to a managed Postgres/SQLite host mainly affects connection config and schema.
  - AI SDK calls read config from environment variables; can be reused unchanged in a cloud deployment.
  - File storage helper can be swapped to S3/Cloud storage without changing UI components.

This architecture satisfies the PRD, leverages **Next.js App Router + ShadCN + AI SDK**, respects the **UUID + SQLite/local-first** constraints, and keeps a clean separation between domains (brands/products/guidelines/assets), AI integration, and the UI layer.
