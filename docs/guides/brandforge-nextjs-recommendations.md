# BrandForge Next.js Architecture Recommendations

## Server Actions vs API Routes

### Use Server Actions For:
| Use Case | Benefits |
|----------|----------|
| Form submissions (create/update/delete) | Progressive enhancement, works without JS |
| Simple mutations | Type-safe, automatic revalidation |
| User-triggered actions | No manual cache invalidation |

### Keep API Routes For:
| Use Case | Reason |
|----------|--------|
| File uploads (`/api/upload`) | Server Actions have 1MB limit |
| AI streaming (`/api/ai/*`) | Streaming requires proper headers |
| External webhooks | Third-party integrations |

---

## Current Architecture

```
src/
├── lib/
│   ├── actions/       # Server Actions (mutations)
│   │   ├── brand-actions.ts
│   │   ├── product-actions.ts
│   │   ├── guideline-actions.ts
│   │   └── asset-actions.ts
│   ├── dal/           # Data Access Layer (queries)
│   │   ├── auth.ts
│   │   ├── brand-dto.ts
│   │   ├── product-dto.ts
│   │   └── guideline-dto.ts
│   └── repositories/  # Database operations
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx # Persistent sidebar
│   │   └── brands/
│   └── api/           # Keep for uploads & AI
```

---

## Persistent Layout Pattern

Dashboard uses shared layout for persistent sidebar:

```tsx
// layout.tsx provides DashboardShell
// Pages use useSetBreadcrumbs() hook
useSetBreadcrumbs([
  { label: "Brands", href: "/brands" },
  { label: brand.name }
])
```

**Result**: Sidebar never re-renders during navigation.

---

## Migration Checklist

- [x] Loading states (`loading.tsx`)
- [x] Error boundaries (`error.tsx`)
- [x] Data Access Layer (DAL)
- [x] Server Actions created
- [x] Persistent dashboard layout
- [ ] Update components to use Server Actions
- [ ] Add automated tests
- [ ] Implement NextAuth.js (Phase 2)
