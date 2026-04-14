// Storage keys — all prefixed 'elmyra_' for easy bulk deletion (GDPR-inspired)
export const STORAGE_KEYS = {
  COMPANION: 'elmyra_companion',
  MILESTONE: 'elmyra_milestone',
  PREFERENCES: 'elmyra_preferences',
  DISCLAIMER_V: 'elmyra_disclaimer_v1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
