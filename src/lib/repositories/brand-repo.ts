import { eq, and } from "drizzle-orm";
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
};
