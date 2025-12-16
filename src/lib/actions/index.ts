/**
 * Server Actions
 * 
 * Centralized mutations with authentication and cache revalidation.
 * 
 * Usage:
 * ```ts
 * import { createBrand, updateProduct, deleteGuideline } from '@/lib/actions'
 * ```
 */

// Brand actions
export {
    createBrand,
    createBrandFromForm,
    updateBrand,
    deleteBrand,
    type CreateBrandInput,
    type UpdateBrandInput,
} from "./brand-actions"

// Product actions
export {
    createProduct,
    createProductFromForm,
    updateProduct,
    deleteProduct,
    deleteProducts,
    type CreateProductInput,
    type UpdateProductInput,
} from "./product-actions"

// Guideline actions
export {
    createGuideline,
    updateGuideline,
    updateGuidelineContent,
    deleteGuideline,
    finalizeGuideline,
    revertToVersion,
    type CreateGuidelineInput,
    type UpdateGuidelineInput,
} from "./guideline-actions"

// Asset actions
export {
    createAsset,
    updateAsset,
    deleteAsset,
    deleteAssets,
    setAssetStatus,
    type CreateAssetInput,
    type UpdateAssetInput,
} from "./asset-actions"
