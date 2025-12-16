"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { guidelineRepository } from "@/lib/repositories/guideline-repo"
import { brandRepository } from "@/lib/repositories/brand-repo"
import { requireAuth } from "@/lib/dal/auth"
import { cookies } from "next/headers"

/**
 * Server Actions for Guideline operations
 */

export interface CreateGuidelineInput {
    brandId: string
    productId?: string
    type: "brand" | "product"
    title: string
    content: Record<string, unknown>
}

/**
 * Create a new guideline
 */
export async function createGuideline(input: CreateGuidelineInput) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(input.brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    const guideline = await guidelineRepository.create({
        brandId: input.brandId,
        productId: input.productId ?? null,
        type: input.type,
        title: input.title,
        content: input.content,
        version: 1,
        status: "draft",
    })

    if (input.productId) {
        revalidatePath(`/brands/${input.brandId}/products/${input.productId}`)
    }
    revalidatePath(`/brands/${input.brandId}`)

    return { success: true, guidelineId: guideline.id }
}

export interface UpdateGuidelineInput {
    title?: string
    content?: Record<string, unknown>
    status?: "draft" | "final"
}

/**
 * Update an existing guideline
 */
export async function updateGuideline(
    id: string,
    brandId: string,
    productId: string | null,
    input: UpdateGuidelineInput
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

    const guideline = await guidelineRepository.update(id, {
        ...(input.title && { title: input.title }),
        ...(input.content && { content: input.content }),
        ...(input.status && { status: input.status }),
    })

    if (productId) {
        revalidatePath(`/brands/${brandId}/products/${productId}`)
    }
    revalidatePath(`/brands/${brandId}`)
    revalidatePath(`/brands/${brandId}/guidelines/${id}`)

    return { success: true, guideline }
}

/**
 * Update only the content field (for AI regeneration)
 */
export async function updateGuidelineContent(
    id: string,
    brandId: string,
    content: Record<string, unknown>
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

    const guideline = await guidelineRepository.update(id, { content })

    revalidatePath(`/brands/${brandId}`)
    revalidatePath(`/brands/${brandId}/guidelines/${id}`)

    return { success: true, guideline }
}

/**
 * Delete a guideline
 */
export async function deleteGuideline(
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

    await guidelineRepository.delete(id)

    if (productId) {
        revalidatePath(`/brands/${brandId}/products/${productId}`)
        redirect(`/brands/${brandId}/products/${productId}`)
    } else {
        revalidatePath(`/brands/${brandId}`)
        redirect(`/brands/${brandId}`)
    }
}

/**
 * Set guideline status to final
 */
export async function finalizeGuideline(id: string, brandId: string) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    const guideline = await guidelineRepository.update(id, { status: "final" })

    revalidatePath(`/brands/${brandId}`)
    revalidatePath(`/brands/${brandId}/guidelines/${id}`)

    return { success: true, guideline }
}

/**
 * Revert to a previous version
 */
export async function revertToVersion(
    id: string,
    brandId: string,
    version: number
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

    const historyEntry = await guidelineRepository.getVersion(id, version)
    if (!historyEntry) {
        throw new Error(`Version ${version} not found`)
    }

    const guideline = await guidelineRepository.update(id, {
        content: historyEntry.content,
    })

    revalidatePath(`/brands/${brandId}`)
    revalidatePath(`/brands/${brandId}/guidelines/${id}`)

    return { success: true, guideline }
}
