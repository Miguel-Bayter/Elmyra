import { z } from 'zod';
import { STORAGE_KEYS } from '@entities/companion/model/constants';

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Reads from localStorage and validates with a Zod schema.
 *
 * Security properties:
 * 1. JSON.parse failure (tampered/corrupted data) → silent removal → null
 * 2. Zod validation failure (schema mismatch) → silent removal → null
 * 3. Error details NEVER exposed to users in production (only console.error in dev)
 *
 * This pattern prevents any malformed/tampered localStorage entry from
 * crashing the app or leaking error details.
 */
export const readFromStorage = <T>(key: string, schema: z.ZodSchema<T>): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsed);

    if (!result.success) {
      // SECURITY: Remove tampered/corrupted data silently
      localStorage.removeItem(key);
      if (import.meta.env.DEV) {
        console.error('[Storage] Validation failed, data removed:', key, result.error);
      }
      return null;
    }

    return result.data;
  } catch {
    // JSON.parse failure = corrupted or tampered data
    localStorage.removeItem(key);
    return null;
  }
};

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Writes a value to localStorage as JSON.
 * Wrapped in try/catch to handle StorageQuotaExceededError gracefully.
 */
export const writeToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    if (import.meta.env.DEV) {
      console.error('[Storage] Write failed for key:', key);
    }
  }
};

// ─── Remove ───────────────────────────────────────────────────────────────────

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore removal failures silently
  }
};

// ─── Delete all app data ──────────────────────────────────────────────────────

/**
 * Removes ALL Elmyra data from localStorage.
 * GDPR-inspired right-to-erasure implementation.
 * Called from the delete-all-data feature.
 */
export const deleteAllAppData = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => removeFromStorage(key));
  // Also remove the language preference stored by i18next-browser-languagedetector
  removeFromStorage('elmyra_language');
};
