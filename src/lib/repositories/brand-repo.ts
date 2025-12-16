import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db";
import { brands, type InsertBrand, type Brand } from "../db/schema";

export const brandRepository = {
  /**
   * Create a new brand
   */
  create: async (data: Omit<InsertBrand, "id" | "createdAt" | "updatedAt">): Promise<Brand> => {
    const [brand] = await db.insert(brands).values(data).returning();
    return brand;
  },

  /**
   * Find brand by ID
   */
  findById: async (id: string): Promise<Brand | undefined> => {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  },

  /**
   * List all brands for a user
   */
  listForUser: async (userId: string): Promise<Brand[]> => {
    return await db.select().from(brands).where(eq(brands.userId, userId));
  },

  /**
   * List all brands for an organization
   */
  listForOrganization: async (organizationId: string): Promise<Brand[]> => {
    return await db.select().from(brands).where(eq(brands.organizationId, organizationId));
  },

  /**
   * List brands for user within a specific organization
   */
  listForUserInOrg: async (userId: string, organizationId: string | null): Promise<Brand[]> => {
    if (organizationId) {
      return await db.select().from(brands).where(
        and(eq(brands.userId, userId), eq(brands.organizationId, organizationId))
      );
    }
    // If no org specified, return brands without org (legacy) or all user brands
    return await db.select().from(brands).where(eq(brands.userId, userId));
  },

  /**
   * Update brand
   */
  update: async (
    id: string,
    data: Partial<Omit<InsertBrand, "id" | "userId">>
  ): Promise<Brand> => {
    const [brand] = await db
      .update(brands)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return brand;
  },

  /**
   * Delete brand
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(brands).where(eq(brands.id, id));
  },

  /**
   * Find brand by name for a specific user
   */
  findByName: async (userId: string, name: string): Promise<Brand | undefined> => {
    const [brand] = await db
      .select()
      .from(brands)
      .where(and(eq(brands.userId, userId), eq(brands.name, name)));
    return brand;
  },

  /**
   * Verify if a brand belongs to an organization
   */
  verifyBrandAccess: async (brandId: string, organizationId: string): Promise<boolean> => {
    const brand = await brandRepository.findById(brandId);
    if (!brand) return false;
    return brand.organizationId === organizationId;
  },
};

