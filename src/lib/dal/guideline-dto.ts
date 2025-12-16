import "server-only"
import { cache } from "react"
import { guidelineRepository } from "@/lib/repositories/guideline-repo"
import type { Guideline, GuidelineHistory } from "@/lib/db/schema"
import { getBrand } from "./brand-dto"

/**
 * Data Access Layer - Guideline DTOs
 * 
 * Provides cached, secure access to guideline data.
 * Verifies brand ownership before returning data.
 */

// Re-export types for convenience
export type { Guideline, GuidelineHistory }

/**
 * Safe guideline DTO
 */
export interface GuidelineDTO {
    id: string
    brandId: string
    productId: string | null
    type: "brand" | "product"
    title: string
    content: Record<string, unknown>
    version: number
    status: "draft" | "final"
    createdAt: Date
    updatedAt: Date
}

/**
 * Transform raw guideline to safe DTO
 */
function toGuidelineDTO(guideline: Guideline): GuidelineDTO {
    return {
        id: guideline.id,
        brandId: guideline.brandId,
        productId: guideline.productId,
        type: guideline.type as "brand" | "product",
        title: guideline.title,
        content: guideline.content,
        version: guideline.version,
        status: guideline.status as "draft" | "final",
        createdAt: guideline.createdAt,
        updatedAt: guideline.updatedAt,
    }
}

/**
 * Get a single guideline by ID.
 * Verifies brand ownership.
 * 
 * @param id - Guideline ID
 * @returns Guideline DTO or null if not found/unauthorized
 */
export const getGuideline = cache(async (id: string): Promise<GuidelineDTO | null> => {
    const guideline = await guidelineRepository.findById(id)
    if (!guideline) return null

    // Verify user owns the parent brand
    const brand = await getBrand(guideline.brandId)
    if (!brand) return null

    return toGuidelineDTO(guideline)
})

/**
 * Get all guidelines for a brand.
 * 
 * @param brandId - Brand ID
 * @returns Array of Guideline DTOs
 */
export const getGuidelinesByBrand = cache(async (brandId: string): Promise<GuidelineDTO[]> => {
    const brand = await getBrand(brandId)
    if (!brand) return []

    const guidelines = await guidelineRepository.listForBrand(brandId)
    return guidelines.map(toGuidelineDTO)
})

/**
 * Get brand guidelines only (type = 'brand').
 */
export const getBrandGuidelines = cache(async (brandId: string): Promise<GuidelineDTO[]> => {
    const all = await getGuidelinesByBrand(brandId)
    return all.filter(g => g.type === "brand")
})

/**
 * Get product guidelines for a specific product.
 */
export const getProductGuidelines = cache(async (productId: string): Promise<GuidelineDTO[]> => {
    const guidelines = await guidelineRepository.listForProduct(productId)
    if (guidelines.length === 0) return []

    // Verify ownership via brand
    const brand = await getBrand(guidelines[0].brandId)
    if (!brand) return []

    return guidelines.map(toGuidelineDTO)
})

/**
 * Get guideline with version history.
 */
export const getGuidelineWithHistory = cache(async (id: string): Promise<{
    guideline: GuidelineDTO
    history: GuidelineHistory[]
} | null> => {
    const guideline = await getGuideline(id)
    if (!guideline) return null

    const history = await guidelineRepository.getHistory(id)

    return {
        guideline,
        history,
    }
})
