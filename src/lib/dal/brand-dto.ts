import "server-only"
import { cache } from "react"
import { brandRepository } from "@/lib/repositories/brand-repo"
import type { Brand } from "@/lib/db/schema"
import { getCurrentUser } from "./auth"

/**
 * Data Access Layer - Brand DTOs
 * 
 * Provides cached, secure access to brand data.
 * All functions verify user ownership before returning data.
 */

// Re-export brand type for convenience
export type { Brand }

/**
 * Safe brand DTO that excludes sensitive fields
 */
export interface BrandDTO {
    id: string
    name: string
    description: string | null
    industry: string | null
    primaryColor: string | null
    secondaryColor: string | null
    fontFamily: string | null
    logoAssetId: string | null
    websiteUrl: string | null
    googleMyBusinessUrl: string | null
    socialMediaUrls: Record<string, string> | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Transform raw brand to safe DTO
 */
function toBrandDTO(brand: Brand): BrandDTO {
    return {
        id: brand.id,
        name: brand.name,
        description: brand.description,
        industry: brand.industry,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        fontFamily: brand.fontFamily,
        logoAssetId: brand.logoAssetId,
        websiteUrl: brand.websiteUrl,
        googleMyBusinessUrl: brand.googleMyBusinessUrl,
        socialMediaUrls: brand.socialMediaUrls,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
    }
}

/**
 * Get a single brand by ID.
 * Cached per-request with React's cache().
 * 
 * @param id - Brand ID
 * @returns Brand DTO or null if not found
 */
export const getBrand = cache(async (id: string): Promise<BrandDTO | null> => {
    const user = await getCurrentUser()
    if (!user) return null

    const brand = await brandRepository.findById(id)
    if (!brand) return null

    // Verify organization access
    if (user.organizationId) {
        if (brand.organizationId !== user.organizationId) {
            return null
        }
    } else {
        // Legacy/Personal fallback
        if (brand.userId !== user.id) {
            return null
        }
    }

    return toBrandDTO(brand)
})

/**
 * Get all brands for the current user/organization.
 * Cached per-request.
 * 
 * @returns Array of Brand DTOs
 */
export const getBrands = cache(async (): Promise<BrandDTO[]> => {
    const user = await getCurrentUser()
    if (!user) return []

    // If org context exists, filter by org
    if (user.organizationId) {
        const brands = await brandRepository.listForOrganization(user.organizationId)
        return brands.map(toBrandDTO)
    }

    // Fallback to user owned brands
    const brands = await brandRepository.listForUser(user.id)
    return brands.map(toBrandDTO)
})

/**
 * Get brand with related products count.
 * Useful for dashboard views.
 */
export const getBrandWithStats = cache(async (id: string): Promise<{
    brand: BrandDTO
    productCount: number
    guidelineCount: number
    assetCount: number
} | null> => {
    const brand = await getBrand(id)
    if (!brand) return null

    // TODO: Add actual counts from repositories
    // For now return placeholder
    return {
        brand,
        productCount: 0,
        guidelineCount: 0,
        assetCount: 0,
    }
})
