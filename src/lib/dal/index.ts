/**
 * Data Access Layer (DAL)
 * 
 * Centralized, secure data access with caching and authorization.
 * 
 * Usage:
 * ```ts
 * import { getCurrentUser, getBrand, getProduct } from '@/lib/dal'
 * ```
 */

// Auth functions
export {
    getCurrentUser,
    verifySession,
    requireAuth,
    hasRole,
    type User,
} from "./auth"

// Brand DTOs
export {
    getBrand,
    getBrands,
    getBrandWithStats,
    type BrandDTO,
} from "./brand-dto"

// Product DTOs
export {
    getProduct,
    getProductsByBrand,
    getProductWithStats,
    type ProductDTO,
} from "./product-dto"

// Guideline DTOs
export {
    getGuideline,
    getGuidelinesByBrand,
    getBrandGuidelines,
    getProductGuidelines,
    getGuidelineWithHistory,
    type GuidelineDTO,
} from "./guideline-dto"
