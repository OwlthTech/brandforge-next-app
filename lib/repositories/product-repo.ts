import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { products, type InsertProduct, type Product } from "../db/schema";

export const productRepository = {
  /**
   * Create a new product
   */
  create: async (
    data: Omit<InsertProduct, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> => {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  },

  /**
   * Find product by ID
   */
  findById: async (id: string): Promise<Product | undefined> => {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  },

  /**
   * List all products for a brand
   */
  listForBrand: async (brandId: string): Promise<Product[]> => {
    return await db.select().from(products).where(eq(products.brandId, brandId));
  },

  /**
   * Update product
   */
  update: async (
    id: string,
    data: Partial<Omit<InsertProduct, "id" | "brandId">>
  ): Promise<Product> => {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  },

  /**
   * Delete product
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(products).where(eq(products.id, id));
  },

  /**
   * Find product by name within a brand
   */
  findByName: async (brandId: string, name: string): Promise<Product | undefined> => {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.brandId, brandId), eq(products.name, name)));
    return product;
  },

  /**
   * Search products by category
   */
  findByCategory: async (brandId: string, category: string): Promise<Product[]> => {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.brandId, brandId), eq(products.category, category)));
  },
};
