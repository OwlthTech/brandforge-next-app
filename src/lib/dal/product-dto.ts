import "server-only"
import { cache } from "react"
import { productRepository } from "@/lib/repositories/product-repo"
import type { Product } from "@/lib/db/schema"
import { getBrand } from "./brand-dto"

/**
 * Data Access Layer - Product DTOs
 * 
 * Provides cached, secure access to product data.
 * Verifies brand ownership before returning data.
 */

// Re-export product type for convenience
export type { Product }

/**
 * Safe product DTO
 */
export interface ProductDTO {
    id: string
    brandId: string
    name: string
    description: string | null
    category: string | null
    tags: string[]
    features: string[] | null
    benefits: string[] | null
    audienceSegments: string[] | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Transform raw product to safe DTO
 */
function toProductDTO(product: Product): ProductDTO {
    return {
        id: product.id,
        brandId: product.brandId,
        name: product.name,
        description: product.description,
        category: product.category,
        tags: product.tags ?? [],
        features: product.features,
        benefits: product.benefits,
        audienceSegments: product.audienceSegments,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    }
}

/**
 * Get a single product by ID.
 * Verifies the user owns the parent brand.
 * 
 * @param id - Product ID
 * @returns Product DTO or null if not found/unauthorized
 */
export const getProduct = cache(async (id: string): Promise<ProductDTO | null> => {
    const product = await productRepository.findById(id)
    if (!product) return null

    // Verify user owns the parent brand
    const brand = await getBrand(product.brandId)
    if (!brand) return null

    return toProductDTO(product)
})

/**
 * Get all products for a brand.
 * Verifies the user owns the brand.
 * 
 * @param brandId - Brand ID
 * @returns Array of Product DTOs
 */
export const getProductsByBrand = cache(async (brandId: string): Promise<ProductDTO[]> => {
    // Verify user owns this brand
    const brand = await getBrand(brandId)
    if (!brand) return []

    const products = await productRepository.listForBrand(brandId)
    return products.map(toProductDTO)
})

/**
 * Get product with related assets count.
 */
export const getProductWithStats = cache(async (id: string): Promise<{
    product: ProductDTO
    assetCount: number
    guidelineCount: number
} | null> => {
    const product = await getProduct(id)
    if (!product) return null

    // TODO: Add actual counts from repositories
    return {
        product,
        assetCount: 0,
        guidelineCount: 0,
    }
})
