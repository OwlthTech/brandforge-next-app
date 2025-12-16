import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAsset, type CreateAssetInput } from '../asset-actions'
import { assetRepository } from '@/lib/repositories/asset-repo'
import { brandRepository } from '@/lib/repositories/brand-repo'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {},
}))
vi.mock('@/lib/repositories/asset-repo')
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

describe('createAsset', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const input: CreateAssetInput = {
        brandId: 'brand-1',
        type: 'brand-image',
        filePath: '/path/to/image.jpg',
    }

    it('should create asset when organizationId is present and verified', async () => {
        // Setup mocks
        mockCookies.get.mockReturnValue({ value: 'org-1' })
        vi.mocked(brandRepository.verifyBrandAccess).mockResolvedValue(true)
        vi.mocked(assetRepository.create).mockResolvedValue({ id: 'asset-1' } as any)

        // Execute
        const result = await createAsset(input)

        // Verify
        expect(result.success).toBe(true)
        expect(brandRepository.verifyBrandAccess).toHaveBeenCalledWith('brand-1', 'org-1')
        expect(assetRepository.create).toHaveBeenCalled()
    })

    it('should throw error when organizationId is present but access denied', async () => {
        // Setup mocks
        mockCookies.get.mockReturnValue({ value: 'org-1' })
        vi.mocked(brandRepository.verifyBrandAccess).mockResolvedValue(false)

        // Execute & Verify
        await expect(createAsset(input)).rejects.toThrow('Unauthorized access to brand')
        expect(assetRepository.create).not.toHaveBeenCalled()
    })

    it('should create asset when no organizationId (legacy/personal mode)', async () => {
        // Setup mocks
        mockCookies.get.mockReturnValue(undefined)
        vi.mocked(assetRepository.create).mockResolvedValue({ id: 'asset-1' } as any)

        // Execute
        const result = await createAsset(input)

        // Verify
        expect(result.success).toBe(true)
        expect(brandRepository.verifyBrandAccess).not.toHaveBeenCalled()
        expect(assetRepository.create).toHaveBeenCalled()
    })
})
