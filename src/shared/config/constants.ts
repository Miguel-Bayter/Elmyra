// Storage keys — all prefixed 'lumina_' for easy bulk deletion (GDPR-inspired)
export const STORAGE_KEYS = {
  COMPANION: 'lumina_companion',
  MILESTONE: 'lumina_milestone',
  PREFERENCES: 'lumina_preferences',
  DISCLAIMER_V: 'lumina_disclaimer_v1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
