import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGuideline, type CreateGuidelineInput } from '../guideline-actions'
import { guidelineRepository } from '@/lib/repositories/guideline-repo'
import { brandRepository } from '@/lib/repositories/brand-repo'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {},
}))
vi.mock('@/lib/repositories/guideline-repo')
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

describe('createGuideline', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const input: CreateGuidelineInput = {
        brandId: 'brand-1',
        type: 'brand',
        title: 'Brand Voice',
        content: { tone: 'Friendly' },
    }

    it('should create guideline when organizationId is present and verified', async () => {
        // Setup mocks
        mockCookies.get.mockReturnValue({ value: 'org-1' })
        vi.mocked(brandRepository.verifyBrandAccess).mockResolvedValue(true)
        vi.mocked(guidelineRepository.create).mockResolvedValue({ id: 'guideline-1' } as any)

        // Execute
        const result = await createGuideline(input)

        // Verify
        expect(result.success).toBe(true)
        expect(brandRepository.verifyBrandAccess).toHaveBeenCalledWith('brand-1', 'org-1')
        expect(guidelineRepository.create).toHaveBeenCalled()
    })

    it('should throw error when organizationId is present but access denied', async () => {
        // Setup mocks
        mockCookies.get.mockReturnValue({ value: 'org-1' })
        vi.mocked(brandRepository.verifyBrandAccess).mockResolvedValue(false)

        // Execute & Verify
        await expect(createGuideline(input)).rejects.toThrow('Unauthorized access to brand')
        expect(guidelineRepository.create).not.toHaveBeenCalled()
    })
})
