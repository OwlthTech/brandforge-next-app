import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { assets, type InsertAsset, type Asset } from "../db/schema";

export const assetRepository = {
  /**
   * Create a new asset
   */
  create: async (data: Omit<InsertAsset, "id" | "createdAt" | "updatedAt">): Promise<Asset> => {
    const [asset] = await db.insert(assets).values(data).returning();
    return asset;
  },

  /**
   * Find asset by ID
   */
  findById: async (id: string): Promise<Asset | undefined> => {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  },

  /**
   * List all assets for a brand
   */
  listForBrand: async (brandId: string): Promise<Asset[]> => {
    return await db.select().from(assets).where(eq(assets.brandId, brandId));
  },

  /**
   * List all assets for a product
   */
  listForProduct: async (productId: string): Promise<Asset[]> => {
    return await db.select().from(assets).where(eq(assets.productId, productId));
  },

  /**
   * List assets by type
   */
  listByType: async (brandId: string, type: Asset["type"]): Promise<Asset[]> => {
    return await db
      .select()
      .from(assets)
      .where(and(eq(assets.brandId, brandId), eq(assets.type, type)));
  },

  /**
   * List product assets by subtype (e.g., front, back, side)
   */
  listBySubtype: async (
    productId: string,
    subtype: Asset["subtype"]
  ): Promise<Asset[]> => {
    const conditions = [eq(assets.productId, productId)];
    if (subtype !== null) {
      conditions.push(eq(assets.subtype, subtype));
    }
    return await db
      .select()
      .from(assets)
      .where(and(...conditions));
  },

  /**
   * List assets generated from a guideline
   */
  listByGuideline: async (guidelineId: string): Promise<Asset[]> => {
    return await db
      .select()
      .from(assets)
      .where(eq(assets.createdFromGuidelineId, guidelineId));
  },

  /**
   * Update asset
   */
  update: async (
    id: string,
    data: Partial<Omit<InsertAsset, "id" | "brandId">>
  ): Promise<Asset> => {
    const [asset] = await db
      .update(assets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return asset;
  },

  /**
   * Delete asset
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(assets).where(eq(assets.id, id));
  },

  /**
   * Update asset status
   */
  updateStatus: async (id: string, status: Asset["status"]): Promise<Asset> => {
    const [asset] = await db
      .update(assets)
      .set({ status, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return asset;
  },
};
