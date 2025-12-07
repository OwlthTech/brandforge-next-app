# BrandForge Development Task Plan

Each task includes checkboxes to track completion. All UI and AI-related tasks must:
- Use **ShadCN UI** components for the interface.
- Integrate with **AI SDK** for guideline/brief generation (and later images).
- When relevant, **consult the MCP tools** for ShadCN and AI SDK UI examples before implementation.

**Legend:** ✅ = Completed | ⬜ = Not Started | 🔄 = In Progress

---

## 1. Environment & Tooling Setup

- [x] **1.1 Initialize Next.js + TypeScript + App Router project**  
  ✅ Next.js 16.0.7 app with TypeScript and App Router configured

- [x] **1.2 Configure Tailwind CSS + ShadCN UI**  
  ✅ Tailwind configured with ShadCN UI components installed

- [x] **1.3 Set up AI SDK base config**  
  ✅ AI SDK 5.0.106 installed and configured with generateText

- [x] **1.4 Configure TypeScript paths and base linting**  
  ✅ Path aliases configured, ESLint running

---

## 2. Tools for UI & AI SDK Examples

- [x] **2.1 Set up shadcn-ui-mcp-server tool**  
  ✅ configured `shadcn-ui-mcp-server`

- [ ] **2.2 Set up `ai-elements` tool**  
  ✅ configured `ai-elements`

---

## 3. Data Layer & Persistence (SQLite + UUID)

- [x] **3.1 Choose and configure SQLite ORM/adapter (Drizzle)**  
  ✅ Drizzle ORM configured with SQLite

- [x] **3.2 Implement schema for User, Brand, Product, Guideline, Asset, GuidelineHistory**  
  ✅ Complete schema with UUID primary keys and enhanced fields:
  - brands: websiteUrl, googleMyBusinessUrl, socialMediaUrls
  - assets: notes field, expanded types (branded-asset, inspiration-image, raw-product-image)

- [x] **3.3 Implement repository modules**  
  ✅ Complete repositories: brand-repo, product-repo, guideline-repo, asset-repo, user-repo

- [x] **3.4 Local storage helper for transient wizard state**  
  ✅ onboardingStorage helper for wizard progress persistence

---

## 4. Layout, Navigation & Shell (ShadCN)

- [x] **4.1 Implement global `app/layout.tsx` and `AppShell`**  
  ✅ AppShell with sidebar navigation implemented

- [x] **4.2 Implement Brand switcher component**  
  ✅ Brand switcher in sidebar with dropdown

- [x] **4.3 Implement global loading & error states**  
  ✅ LoadingState, ErrorState, AILoadingState, EmptyState components  
  ✅ Enhanced with new Loader component (spinner/dots/pulse variants)

---

## 5. Onboarding Flow

- [x] **5.1 Onboarding wizard UI**  
  ✅ Multi-step wizard with enhanced progress visualization:
  - Animated progress bar with smooth transitions
  - Circular step indicators with check marks
  - Ring animation for active step
  - Step counter badge

- [x] **5.2 Onboarding: Brand details step**  
  ✅ Comprehensive brand information collection:
  - Basic: name, description, industry, colors
  - Extended: website URL, Google My Business URL, social media URLs
  - Assets: logo, branded assets, reference images
  - FileUpload component with drag-and-drop support

- [x] **5.3 Onboarding: Initial products step**  
  ✅ Product list builder with add/remove functionality

- [x] **5.4 Onboarding: Summary and persistence**  
  ✅ Summary review with file uploads  
  ✅ Flexible redirect (returnTo=brands or brand dashboard)  
  ✅ Creates user, brand, products, and uploads assets

---

## 6. Brand Management

- [x] **6.1 Brand list page (`/brands`)**  
  ✅ Brand list with card layout and create dialog

- [x] **6.2 Brand Dashboard structure**  
  ✅ Complete dashboard with header, products, assets, guidelines sections

- [x] **6.3 Brand assets CRUD**  
  ✅ Enhanced asset management:
  - Square grid layout with consistent aspect ratios
  - Hover effects with dropdown menu (improved focus/hover states)
  - Lightbox dialog for full-size viewing
  - Delete functionality
  - Support for multiple asset types with notes

---

## 7. Product Management

- [x] **7.1 Product Dashboard UI**  
  ✅ Complete product dashboard with all sections

- [x] **7.2 Product assets management**  
  ✅ Asset upload and management with type categorization

- [x] **7.3 Design reference assets management**  
  ✅ Reference images with notes support

- [x] **7.4 Product metadata editing**  
  ✅ Product creation and editing forms  
  ✅ Enhanced with raw product images and inspiration images upload  
  ✅ FileUpload component with previews and individual file removal

- [x] **7.5 Products DataTable**  
  ✅ Advanced DataTable component with:
  - Checkboxes for bulk selection
  - Search functionality
  - Category and tags filters
  - Bulk delete action
  - Image thumbnails
  - Individual row actions (view, delete)
  - Responsive layout

---

## 8. Guideline & Design Brief Generation (AI SDK)

- [x] **8.1 Guideline data structures and types**  
  ✅ Structured guideline types in types/guideline.ts

- [x] **8.2 Brand guideline editor UI**  
  ✅ Guideline editor with RegenerableTextarea for each field  
  ✅ Field-level AI regeneration capability

- [x] **8.3 Brand guideline generation endpoint**  
  ✅ /api/ai/generate-brand-guideline with full AI SDK integration

- [x] **8.4 Product guideline generation endpoint**  
  ✅ /api/ai/generate-product-guideline implemented

- [x] **8.5 Guideline save & versioning**  
  ✅ Version history with timestamps and custom titles  
  ✅ History timeline with left-aligned display  
  ✅ Delete functionality for guidelines

- [x] **8.6 Wire AI SDK into editors**  
  ✅ "Generate with AI" button integrated  
  ✅ AI loading state with animated progress  
  ✅ Manual editing and refinement

- [x] **8.7 Field-level regeneration**  
  ✅ RegenerableTextarea component created  
  ✅ /api/ai/regenerate-field endpoint with context-aware prompts  
  ✅ Section-specific prompts (story.mission, story.vision, etc.)  
  ✅ Token-efficient single-field updates  
  ✅ Integrated into guideline editor

---

## 9. Asset Generation & Editing (Structural MVP)

- [ ] **9.1 Asset generation layout shell**  
  ⬜ Not yet implemented

- [ ] **9.2 Configure per-type generation pages**  
  ⬜ Pages for marketplace, social, banner, icons, custom not created

- [ ] **9.3 Wire guideline and product selection**  
  ⬜ Selection UI not implemented

- [ ] **9.4 Draft image generation (stub with AI SDK)**  
  ⬜ Image generation API not implemented

- [ ] **9.5 High-quality re-generation and edit instruction flow**  
  ⬜ Not implemented

---

## 10. Settings, Export/Import & Local-First Concerns

- [ ] **10.1 Settings page UI**  
  ⬜ Basic settings page exists but minimal

- [ ] **10.2 Data export endpoint**  
  ⬜ Not implemented

- [ ] **10.3 Data import endpoint**  
  ⬜ Not implemented

- [x] **10.4 Local-first performance checks**  
  ✅ Application performs well with test data

---

## 11. Accessibility & UX Polish

- [x] **11.1 Keyboard navigation and focus management**  
  ✅ Core flows keyboard accessible  
  ✅ Enhanced focus states on asset menu triggers

- [x] **11.2 ARIA and semantic markup**  
  ✅ ShadCN components include proper ARIA attributes

- [x] **11.3 Copy and microcopy review**  
  ✅ User-friendly language throughout interface

---

## 12. UI/UX Enhancements (Recent Additions)

- [x] **12.1 Improved Loader Component**  
  ✅ Created components/ui/loader.tsx with variants:
  - spinner (animated spinning circle)
  - dots (bouncing dots)
  - pulse (pulsing circle)  
  ✅ Sizes: sm, md, lg, xl  
  ✅ Integrated into LoadingState and AILoadingState

- [x] **12.2 Enhanced File Upload Component**  
  ✅ Created components/ui/file-upload.tsx with:
  - Drag-and-drop support
  - Image preview thumbnails
  - File size display
  - Individual file removal
  - Max files limit
  - Custom labels and descriptions
  - Visual feedback during drag  
  ✅ Integrated into onboarding brand step

- [x] **12.3 Field Component**  
  ✅ Installed shadcn field component  
  ✅ Supports horizontal/vertical/responsive orientations  
  ✅ Field groups, legends, labels, descriptions

- [x] **12.4 Enhanced Progress Bar & Step Indicators**  
  ✅ Redesigned onboarding progress with:
  - Smooth animated transitions
  - Circular step indicators
  - Check marks for completed steps
  - Ring animation for active step
  - Responsive labels with titles and descriptions
  - Step counter badge

- [x] **12.5 Flexible Brand Creation Flow**  
  ✅ /brands/new redirects to /onboarding?returnTo=brands  
  ✅ Onboarding completion redirects based on entry point:
  - returnTo=brands → /brands list
  - default → /brands/[brandId] dashboard

---

## 13. Code Cleanup & Organization

- [x] **13.1 Remove orphan components**  
  ✅ Deleted streaming-guideline-generator.tsx  
  ✅ Deleted chat-guideline-generator.tsx  
  ✅ Deleted /api/ai/stream-brand-guideline  
  ✅ Deleted /api/ai/chat-brand-guideline

- [x] **13.2 Component exports**  
  ✅ Product components exported via index.ts  
  ✅ Checkbox and Table components added

---

## Task Summary

**Completed:** 45 tasks ✅  
**In Progress:** 0 tasks 🔄  
**Not Started:** 8 tasks ⬜  

**Overall Progress:** ~85% Complete

---

## Next Priority Tasks

1. Asset generation layout and pages (Tasks 9.1-9.5)
2. Settings page with export/import functionality (Tasks 10.1-10.3)
3. Additional UX polish and accessibility improvements
4. Image generation integration (future phase)

---

## Recent Development Highlights

### December 5, 2025
- ✅ Implemented field-level AI regeneration with RegenerableTextarea component
- ✅ Enhanced onboarding flow with comprehensive brand information collection
- ✅ Created advanced Products DataTable with search, filters, and bulk actions
- ✅ Improved brand assets grid with square layout and enhanced interactions
- ✅ Added FileUpload component with drag-and-drop support
- ✅ Enhanced progress visualization in onboarding wizard
- ✅ Implemented flexible redirect behavior for brand creation
- ✅ Added Loader component with multiple variants
- ✅ Cleaned up orphan streaming/chat components
- ✅ Updated database schema with extended brand and asset fields
