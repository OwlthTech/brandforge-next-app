import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Helper function to generate UUID for primary keys
 */
export const generateId = () => randomUUID();

/**
 * Organization table (multi-tenant support)
 */
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

/**
 * User table
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Team Members table (user-organization-role mapping)
 * One user can belong to multiple organizations with different roles
 */
export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  role: text("role", {
    enum: ["owner", "admin", "editor", "viewer", "ai_operator"]
  }).notNull().default("viewer"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Brand table
 */
export const brands = sqliteTable("brands", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  organizationId: text("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  fontFamily: text("font_family"),
  logoAssetId: text("logo_asset_id"),
  websiteUrl: text("website_url"),
  googleMyBusinessUrl: text("google_my_business_url"),
  socialMediaUrls: text("social_media_urls", { mode: "json" }).$type<Record<string, string>>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

/**
 * Product table
 */
export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  features: text("features", { mode: "json" }).$type<string[]>(),
  benefits: text("benefits", { mode: "json" }).$type<string[]>(),
  audienceSegments: text("audience_segments", { mode: "json" }).$type<string[]>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

/**
 * Guideline table
 */
export const guidelines = sqliteTable("guidelines", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["brand", "product"] }).notNull(),
  title: text("title").notNull(),
  content: text("content", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  version: integer("version").notNull().default(1),
  status: text("status", { enum: ["draft", "final"] }).notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

/**
 * Asset table
 */
export const assets = sqliteTable("assets", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["brand-image", "product-image", "design-reference", "generated-asset", "logo", "branded-asset", "inspiration-image", "raw-product-image"],
  }).notNull(),
  subtype: text("subtype", {
    enum: [
      "front",
      "back",
      "side",
      "angled",
      "detail",
      "banner",
      "marketplace",
      "social",
      "icon",
      "custom",
    ],
  }),
  filePath: text("file_path").notNull(),
  altText: text("alt_text"),
  notes: text("notes"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdFromGuidelineId: text("created_from_guideline_id").references(() => guidelines.id),
  status: text("status", { enum: ["draft", "approved", "needs-revision"] }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

/**
 * GuidelineHistory table
 */
export const guidelineHistory = sqliteTable("guideline_history", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  guidelineId: text("guideline_id")
    .notNull()
    .references(() => guidelines.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  content: text("content", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Audit Logs table (action tracking)
 */
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  userId: text("user_id").references(() => users.id),
  organizationId: text("organization_id").references(() => organizations.id),
  action: text("action").notNull(), // e.g., "brand.create", "guideline.delete"
  resourceType: text("resource_type").notNull(), // e.g., "brand", "product"
  resourceId: text("resource_id"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});


/**
 * Relations
 */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  teamMembers: many(teamMembers),
  brands: many(brands),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ many }) => ({
  brands: many(brands),
  teamMemberships: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [teamMembers.organizationId],
    references: [organizations.id],
  }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [brands.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
  products: many(products),
  guidelines: many(guidelines),
  assets: many(assets),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  guidelines: many(guidelines),
  assets: many(assets),
}));

export const guidelinesRelations = relations(guidelines, ({ one, many }) => ({
  brand: one(brands, {
    fields: [guidelines.brandId],
    references: [brands.id],
  }),
  product: one(products, {
    fields: [guidelines.productId],
    references: [products.id],
  }),
  history: many(guidelineHistory),
  generatedAssets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  brand: one(brands, {
    fields: [assets.brandId],
    references: [brands.id],
  }),
  product: one(products, {
    fields: [assets.productId],
    references: [products.id],
  }),
  guideline: one(guidelines, {
    fields: [assets.createdFromGuidelineId],
    references: [guidelines.id],
  }),
}));

export const guidelineHistoryRelations = relations(guidelineHistory, ({ one }) => ({
  guideline: one(guidelines, {
    fields: [guidelineHistory.guidelineId],
    references: [guidelines.id],
  }),
}));

/**
 * Type exports
 */
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Guideline = typeof guidelines.$inferSelect;
export type InsertGuideline = typeof guidelines.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

export type GuidelineHistory = typeof guidelineHistory.$inferSelect;
export type InsertGuidelineHistory = typeof guidelineHistory.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Role type for RBAC
export type Role = "owner" | "admin" | "editor" | "viewer" | "ai_operator";
