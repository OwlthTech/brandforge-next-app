"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { productRepository } from "@/lib/repositories/product-repo"
import { brandRepository } from "@/lib/repositories/brand-repo"
import { requireAuth } from "@/lib/dal/auth"
import { cookies } from "next/headers"

/**
 * Server Actions for Product operations
 */

export interface CreateProductInput {
    brandId: string
    name: string
    description?: string
    category?: string
    tags?: string[]
    features?: string[]
    benefits?: string[]
    audienceSegments?: string[]
}

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(input.brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    const product = await productRepository.create({
        brandId: input.brandId,
        name: input.name,
        description: input.description ?? null,
        category: input.category ?? null,
        tags: input.tags ?? [],
        features: input.features ?? null,
        benefits: input.benefits ?? null,
        audienceSegments: input.audienceSegments ?? null,
    })

    revalidatePath(`/brands/${input.brandId}`)
    return { success: true, productId: product.id }
}

/**
 * Create product from form data
 */
export async function createProductFromForm(formData: FormData) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    const brandId = formData.get("brandId") as string

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }
    const tagsStr = formData.get("tags") as string

    const product = await productRepository.create({
        brandId,
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || null,
        category: (formData.get("category") as string) || null,
        tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()) : [],
        features: null,
        benefits: null,
        audienceSegments: null,
    })

    revalidatePath(`/brands/${brandId}`)
    redirect(`/brands/${brandId}/products/${product.id}`)
}

export interface UpdateProductInput {
    name?: string
    description?: string
    category?: string
    tags?: string[]
    features?: string[]
    benefits?: string[]
    audienceSegments?: string[]
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, brandId: string, input: UpdateProductInput) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    const product = await productRepository.update(id, {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.features !== undefined && { features: input.features }),
        ...(input.benefits !== undefined && { benefits: input.benefits }),
        ...(input.audienceSegments !== undefined && { audienceSegments: input.audienceSegments }),
    })

    revalidatePath(`/brands/${brandId}/products/${id}`)
    revalidatePath(`/brands/${brandId}`)
    return { success: true, product }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string, brandId: string) {
    await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    if (organizationId) {
        const hasAccess = await brandRepository.verifyBrandAccess(brandId, organizationId)
        if (!hasAccess) {
            throw new Error("Unauthorized access to brand")
        }
    }

    await productRepository.delete(id)

    revalidatePath(`/brands/${brandId}`)
    redirect(`/brands/${brandId}`)
}

/**
 * Bulk delete products
 */
export async function deleteProducts(ids: string[], brandId: string) {
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
        await productRepository.delete(id)
    }

    revalidatePath(`/brands/${brandId}`)
    return { success: true, deletedCount: ids.length }
}
