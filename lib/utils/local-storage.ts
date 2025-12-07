/**
 * Local storage helper for managing transient client-side state
 * Used for onboarding progress, unsaved forms, and wizard state
 */

const STORAGE_PREFIX = "brandforge_";

export const localStorageHelper = {
  /**
   * Save data to local storage with BrandForge prefix
   */
  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
  },

  /**
   * Get data from local storage
   */
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return null;
    }
  },

  /**
   * Remove item from local storage
   */
  remove: (key: string): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
  },

  /**
   * Clear all BrandForge items from local storage
   */
  clear: (): void => {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  /**
   * Check if a key exists in local storage
   */
  has: (key: string): boolean => {
    if (typeof window === "undefined") return false;

    return localStorage.getItem(`${STORAGE_PREFIX}${key}`) !== null;
  },
};

/**
 * Onboarding-specific helpers
 */
export const onboardingStorage = {
  /**
   * Save onboarding progress
   */
  saveProgress: (data: {
    currentStep: number;
    brandData?: Record<string, unknown>;
    productsData?: Record<string, unknown>[];
  }): void => {
    localStorageHelper.set("onboarding_progress", data);
  },

  /**
   * Get onboarding progress
   */
  getProgress: (): {
    currentStep: number;
    brandData?: Record<string, unknown>;
    productsData?: Record<string, unknown>[];
  } | null => {
    return localStorageHelper.get("onboarding_progress");
  },

  /**
   * Clear onboarding progress
   */
  clearProgress: (): void => {
    localStorageHelper.remove("onboarding_progress");
  },

  /**
   * Check if onboarding is in progress
   */
  hasProgress: (): boolean => {
    return localStorageHelper.has("onboarding_progress");
  },
};

/**
 * Form draft helpers
 */
export const formDraftStorage = {
  /**
   * Save form draft
   */
  saveDraft: (formId: string, data: Record<string, unknown>): void => {
    localStorageHelper.set(`draft_${formId}`, {
      data,
      savedAt: new Date().toISOString(),
    });
  },

  /**
   * Get form draft
   */
  getDraft: (formId: string): Record<string, unknown> | null => {
    const draft = localStorageHelper.get<{ data: Record<string, unknown>; savedAt: string }>(`draft_${formId}`);
    return draft ? draft.data : null;
  },

  /**
   * Get draft metadata (saved time)
   */
  getDraftMeta: (formId: string): { savedAt: string } | null => {
    const draft = localStorageHelper.get<{ data: Record<string, unknown>; savedAt: string }>(`draft_${formId}`);
    return draft ? { savedAt: draft.savedAt } : null;
  },

  /**
   * Clear form draft
   */
  clearDraft: (formId: string): void => {
    localStorageHelper.remove(`draft_${formId}`);
  },

  /**
   * Check if draft exists
   */
  hasDraft: (formId: string): boolean => {
    return localStorageHelper.has(`draft_${formId}`);
  },
};

export default localStorageHelper;
