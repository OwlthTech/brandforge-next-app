import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import {
  guidelines,
  guidelineHistory,
  type InsertGuideline,
  type Guideline,
  type GuidelineHistory,
} from "../db/schema";

export const guidelineRepository = {
  /**
   * Create a new guideline with history entry
   */
  create: async (
    data: Omit<InsertGuideline, "id" | "createdAt" | "updatedAt">
  ): Promise<Guideline> => {
    const [guideline] = await db.insert(guidelines).values(data).returning();

    // Create initial history entry
    await db.insert(guidelineHistory).values({
      guidelineId: guideline.id,
      version: guideline.version,
      content: guideline.content,
    });

    return guideline;
  },

  /**
   * Find guideline by ID
   */
  findById: async (id: string): Promise<Guideline | undefined> => {
    const [guideline] = await db.select().from(guidelines).where(eq(guidelines.id, id));
    return guideline;
  },

  /**
   * List brand guidelines
   */
  listForBrand: async (brandId: string): Promise<Guideline[]> => {
    return await db
      .select()
      .from(guidelines)
      .where(and(eq(guidelines.brandId, brandId), eq(guidelines.type, "brand")))
      .orderBy(desc(guidelines.updatedAt));
  },

  /**
   * List product guidelines
   */
  listForProduct: async (productId: string): Promise<Guideline[]> => {
    return await db
      .select()
      .from(guidelines)
      .where(and(eq(guidelines.productId, productId), eq(guidelines.type, "product")))
      .orderBy(desc(guidelines.updatedAt));
  },

  /**
   * Update guideline and create history entry
   */
  update: async (
    id: string,
    data: Partial<Omit<InsertGuideline, "id" | "brandId" | "productId">>
  ): Promise<Guideline> => {
    const current = await guidelineRepository.findById(id);
    if (!current) {
      throw new Error(`Guideline ${id} not found`);
    }

    const newVersion = current.version + 1;

    const [guideline] = await db
      .update(guidelines)
      .set({
        ...data,
        version: newVersion,
        updatedAt: new Date(),
      })
      .where(eq(guidelines.id, id))
      .returning();

    // Create history entry for new version
    await db.insert(guidelineHistory).values({
      guidelineId: guideline.id,
      version: newVersion,
      content: guideline.content,
    });

    return guideline;
  },

  /**
   * Delete guideline and all its history
   */
  delete: async (id: string): Promise<void> => {
    // Delete history entries first
    await db.delete(guidelineHistory).where(eq(guidelineHistory.guidelineId, id));
    // Delete guideline
    await db.delete(guidelines).where(eq(guidelines.id, id));
  },

  /**
   * Get guideline history
   */
  getHistory: async (guidelineId: string): Promise<GuidelineHistory[]> => {
    return await db
      .select()
      .from(guidelineHistory)
      .where(eq(guidelineHistory.guidelineId, guidelineId))
      .orderBy(desc(guidelineHistory.version));
  },

  /**
   * Get specific version from history
   */
  getVersion: async (guidelineId: string, version: number): Promise<GuidelineHistory | undefined> => {
    const [history] = await db
      .select()
      .from(guidelineHistory)
      .where(
        and(eq(guidelineHistory.guidelineId, guidelineId), eq(guidelineHistory.version, version))
      );
    return history;
  },

  /**
   * Create a standalone history entry (for AI-generated drafts before saving)
   */
  createHistoryEntry: async (
    brandId: string,
    productId: string | null,
    type: "brand" | "product",
    content: Record<string, unknown>
  ): Promise<GuidelineHistory> => {
    const [history] = await db.insert(guidelineHistory).values({
      guidelineId: `temp-${brandId}-${Date.now()}`, // Temporary ID for unsaved guidelines
      version: 1,
      content,
    }).returning();
    return history;
  },
};
