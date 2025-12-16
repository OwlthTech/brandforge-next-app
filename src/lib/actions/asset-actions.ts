"use server"

import { revalidatePath } from "next/cache"
import { assetRepository } from "@/lib/repositories/asset-repo"
import { brandRepository } from "@/lib/repositories/brand-repo"
import { requireAuth } from "@/lib/dal/auth"
import { cookies } from "next/headers"

/**
 * Server Actions for Asset operations
 */

export interface CreateAssetInput {
    brandId: string
    productId?: string
    type: "brand-image" | "product-image" | "design-reference" | "generated-asset" | "logo" | "branded-asset" | "inspiration-image" | "raw-product-image"
    subtype?: "front" | "back" | "side" | "angled" | "detail" | "banner" | "marketplace" | "social" | "icon" | "custom"
    filePath: string
    altText?: string
    notes?: string
    metadata?: Record<string, unknown>
    createdFromGuidelineId?: string
    status?: "draft" | "approved" | "needs-revision"
}

/**
 * Create a new asset
 */
export async function createAsset(input: CreateAssetInput) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(input.brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    const asset = await assetRepository.create({
        brandId: input.brandId,
        productId: input.productId ?? null,
        type: input.type,
        subtype: input.subtype ?? null,
        filePath: input.filePath,
        altText: input.altText ?? null,
        notes: input.notes ?? null,
        metadata: input.metadata ?? null,
        createdFromGuidelineId: input.createdFromGuidelineId ?? null,
        status: input.status ?? null,
    })

    if (input.productId) {
        revalidatePath(`/brands/${input.brandId}/products/${input.productId}`)
    }
    revalidatePath(`/brands/${input.brandId}`)

    return { success: true, assetId: asset.id }
}

export interface UpdateAssetInput {
    altText?: string
    notes?: string
    status?: "draft" | "approved" | "needs-revision"
    metadata?: Record<string, unknown>
}

/**
 * Update an existing asset
 */
export async function updateAsset(
    id: string,
    brandId: string,
    productId: string | null,
    input: UpdateAssetInput
) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    const asset = await assetRepository.update(id, {
        ...(input.altText !== undefined && { altText: input.altText }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
    })

    if (productId) {
        revalidatePath(`/brands/${brandId}/products/${productId}`)
    }
    revalidatePath(`/brands/${brandId}`)

    return { success: true, asset }
}

/**
 * Delete an asset
 */
export async function deleteAsset(
    id: string,
    brandId: string,
    productId: string | null
) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    await assetRepository.delete(id)

    if (productId) {
        revalidatePath(`/brands/${brandId}/products/${productId}`)
    }
    revalidatePath(`/brands/${brandId}`)

    return { success: true }
}

/**
 * Bulk delete assets
 */
export async function deleteAssets(
    ids: string[],
    brandId: string,
    productId: string | null
) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    for (const id of ids) {
        await assetRepository.delete(id)
    }

    if (productId) {
        revalidatePath(`/brands/${brandId}/products/${productId}`)
    }
    revalidatePath(`/brands/${brandId}`)

    return { success: true, deletedCount: ids.length }
}

/**
 * Update asset status (for approval workflow)
 */
export async function setAssetStatus(
    id: string,
    brandId: string,
    status: "draft" | "approved" | "needs-revision"
) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    const asset = await assetRepository.update(id, { status })

    revalidatePath(`/brands/${brandId}`)

    return { success: true, asset }
}
