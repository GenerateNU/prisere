/**
 * Temporary storage utilities for claim form data
 * Stores uncommitted field data in localStorage as a safety net
 */

import { ClaimStepData, ClaimStepNumber } from "@/types/claim";

const STORAGE_PREFIX = "claim-temp-";

export interface TempStorage<T extends ClaimStepNumber = ClaimStepNumber> {
    claimId: string;
    step: T;
    tempData: ClaimStepData<T>;
    lastSaved: string;
}

/**
 * Save temporary data for the current step
 */
export function saveTempData<T extends ClaimStepNumber>(claimId: string, step: T, data: ClaimStepData<T>): void {
    try {
        const storageKey = `${STORAGE_PREFIX}${claimId}`;
        const storageData: TempStorage<T> = {
            claimId,
            step,
            tempData: data,
            lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(storageData));
    } catch (error) {
        console.error("Error saving temp data to localStorage:", error);
    }
}

/**
 * Load temporary data for a specific claim and step
 */
export function loadTempData<T extends ClaimStepNumber>(claimId: string, step: T): ClaimStepData<T> | null {
    try {
        const storageKey = `${STORAGE_PREFIX}${claimId}`;
        const stored = localStorage.getItem(storageKey);

        if (!stored) {
            return null;
        }

        const data = JSON.parse(stored) as TempStorage<T>;

        // Only return data if it's for the same step
        if (data.step === step && data.claimId === claimId) {
            return deserializeDates<T>(step, data.tempData);
        }

        return null;
    } catch (error) {
        console.error("Error loading temp data from localStorage:", error);
        return null;
    }
}

/**
 * Deserialize date strings back to Date objects
 */
function deserializeDates<T extends ClaimStepNumber>(step: T, data: ClaimStepData<T>): ClaimStepData<T> {
    if (!data) return data;

    const _result = { ...data };

    // Handle disaster info dates (only for step 0)
    if (step === 0) {
        const result = _result as ClaimStepData<0>;
        result.disasterInfo = { ...result.disasterInfo };
        if (result.disasterInfo.startDate && typeof result.disasterInfo.startDate === "string") {
            result.disasterInfo.startDate = new Date(result.disasterInfo.startDate);
        }
        if (result.disasterInfo.endDate && typeof result.disasterInfo.endDate === "string") {
            result.disasterInfo.endDate = new Date(result.disasterInfo.endDate);
        }

        return result as ClaimStepData<T>;
    }

    return _result;
}

/**
 * Clear all temporary data for a claim
 */
export function clearTempData(claimId: string): void {
    try {
        const storageKey = `${STORAGE_PREFIX}${claimId}`;
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.error("Error clearing temp data from localStorage:", error);
    }
}

/**
 * Clear temporary data for a specific step
 * (In our case, this is the same as clearing all temp data since we only store current step)
 */
export function clearStepTempData(claimId: string, step: ClaimStepNumber): void {
    try {
        const storageKey = `${STORAGE_PREFIX}${claimId}`;
        const stored = localStorage.getItem(storageKey);

        if (!stored) {
            return;
        }

        const data = JSON.parse(stored) as TempStorage;

        // Only clear if it's for the specified step
        if (data.step === step) {
            localStorage.removeItem(storageKey);
        }
    } catch (error) {
        console.error("Error clearing step temp data from localStorage:", error);
    }
}

/**
 * Get all temp storage keys (for debugging/cleanup)
 */
export function getAllTempStorageKeys(): string[] {
    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                keys.push(key);
            }
        }
        return keys;
    } catch (error) {
        console.error("Error getting temp storage keys:", error);
        return [];
    }
}

/**
 * Clean up old temp data (older than 30 days)
 */
export function cleanExpiredTempData(): void {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const keys = getAllTempStorageKeys();

        for (const key of keys) {
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    const data = JSON.parse(stored) as TempStorage;
                    const savedDate = new Date(data.lastSaved);

                    if (savedDate < thirtyDaysAgo) {
                        localStorage.removeItem(key);
                    }
                } catch {
                    // If we can't parse it, remove it
                    localStorage.removeItem(key);
                }
            }
        }
    } catch (error) {
        console.error("Error cleaning expired temp data:", error);
    }
}
