import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProduct, type CreateProductInput } from '../product-actions'
import { productRepository } from '@/lib/repositories/product-repo'
import { brandRepository } from '@/lib/repositories/brand-repo'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {},
}))
vi.mock('@/lib/repositories/product-repo')
vi.mock('@/lib/repositories/brand-repo')
vi.mock('@/lib/dal/auth', () => ({
    requireAuth: vi.fn(),
}))
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

const mockCookies = {
    get: vi.fn(),
}
vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve(mockCookies),
}))

describe('createProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const input: CreateProductInput = {
        brandId: 'brand-1',
        name: 'Test Product',
    }

    it('should create product when organizationId is present and verified', async () => {
        // Setup mocks
        mockCookies.get.mockReturnValue({ value: 'org-1' })
        vi.mocked(brandRepository.verifyBrandAccess).mockResolvedValue(true)
        vi.mocked(productRepository.create).mockResolvedValue({ id: 'product-1' } as any)

        // Execute
        const result = await createProduct(input)

        // Verify
        expect(result.success).toBe(true)
        expect(brandRepository.verifyBrandAccess).toHaveBeenCalledWith('brand-1', 'org-1')
        expect(productRepository.create).toHaveBeenCalled()
    })

    it('should throw error when organizationId is present but access denied', async () => {
        // Setup mocks
        mockCookies.get.mockReturnValue({ value: 'org-1' })
        vi.mocked(brandRepository.verifyBrandAccess).mockResolvedValue(false)

        // Execute & Verify
        await expect(createProduct(input)).rejects.toThrow('Unauthorized access to brand')
        expect(productRepository.create).not.toHaveBeenCalled()
    })
})
