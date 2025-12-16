"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { brandRepository } from "@/lib/repositories/brand-repo"
import { requireAuth } from "@/lib/dal/auth"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"
import { cookies } from "next/headers"

/**
 * Server Actions for Brand operations
 * 
 * These actions replace direct API route calls and provide:
 * - Automatic revalidation after mutations
 * - Built-in authentication checks
 * - Audit logging for all operations
 * - Type-safe form handling
 */

export interface CreateBrandInput {
    name: string
    description?: string
    industry?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    websiteUrl?: string
    googleMyBusinessUrl?: string
    socialMediaUrls?: Record<string, string>
}

/**
 * Create a new brand
 */
export async function createBrand(input: CreateBrandInput) {
    const user = await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    const brand = await brandRepository.create({
        userId: user.id,
        name: input.name,
        description: input.description ?? null,
        industry: input.industry ?? null,
        primaryColor: input.primaryColor ?? null,
        secondaryColor: input.secondaryColor ?? null,
        fontFamily: input.fontFamily ?? null,
        websiteUrl: input.websiteUrl ?? null,
        googleMyBusinessUrl: input.googleMyBusinessUrl ?? null,
        socialMediaUrls: input.socialMediaUrls ?? null,
        logoAssetId: null,
        organizationId: organizationId || null,
    })

    // Log audit
    await logAudit({
        action: AUDIT_ACTIONS.BRAND_CREATE,
        resourceType: "brand",
        resourceId: brand.id,
        metadata: { name: input.name },
    })

    revalidatePath("/brands")
    return { success: true, brandId: brand.id }
}

/**
 * Create brand from form data (for use with native forms)
 */
export async function createBrandFromForm(formData: FormData) {
    const user = await requireAuth()
    const cookieStore = await cookies()
    const organizationId = cookieStore.get("organization_id")?.value

    const brand = await brandRepository.create({
        userId: user.id,
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || null,
        industry: (formData.get("industry") as string) || null,
        primaryColor: (formData.get("primaryColor") as string) || null,
        secondaryColor: (formData.get("secondaryColor") as string) || null,
        fontFamily: null,
        websiteUrl: null,
        googleMyBusinessUrl: null,
        socialMediaUrls: null,
        logoAssetId: null,
        organizationId: organizationId || null,
    })

    // Log audit
    await logAudit({
        action: AUDIT_ACTIONS.BRAND_CREATE,
        resourceType: "brand",
        resourceId: brand.id,
        metadata: { name: formData.get("name") },
    })

    revalidatePath("/brands")
    redirect(`/brands/${brand.id}`)
}

export interface UpdateBrandInput {
    name?: string
    description?: string
    industry?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    websiteUrl?: string
    googleMyBusinessUrl?: string
    socialMediaUrls?: Record<string, string>
    logoAssetId?: string
}

/**
 * Update an existing brand
 */
export async function updateBrand(id: string, input: UpdateBrandInput) {
    await requireAuth()

    // Verify ownership is done in repository layer via DAL
    const brand = await brandRepository.update(id, {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor }),
        ...(input.secondaryColor !== undefined && { secondaryColor: input.secondaryColor }),
        ...(input.fontFamily !== undefined && { fontFamily: input.fontFamily }),
        ...(input.websiteUrl !== undefined && { websiteUrl: input.websiteUrl }),
        ...(input.googleMyBusinessUrl !== undefined && { googleMyBusinessUrl: input.googleMyBusinessUrl }),
        ...(input.socialMediaUrls !== undefined && { socialMediaUrls: input.socialMediaUrls }),
        ...(input.logoAssetId !== undefined && { logoAssetId: input.logoAssetId }),
    })

    // Log audit
    await logAudit({
        action: AUDIT_ACTIONS.BRAND_UPDATE,
        resourceType: "brand",
        resourceId: id,
        metadata: { updatedFields: Object.keys(input) },
    })

    revalidatePath(`/brands/${id}`)
    revalidatePath("/brands")
    return { success: true, brand }
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: string) {
    await requireAuth()

    // Log audit before delete
    await logAudit({
        action: AUDIT_ACTIONS.BRAND_DELETE,
        resourceType: "brand",
        resourceId: id,
    })

    await brandRepository.delete(id)

    revalidatePath("/brands")
    redirect("/brands")
}
