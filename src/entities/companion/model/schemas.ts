import { z } from 'zod';

// ─── Stat value ───────────────────────────────────────────────────────────────
// All game stats: integers 0–100 (inclusive)
export const statValueSchema = z.number().int().min(0).max(100);

// ─── Companion name ───────────────────────────────────────────────────────────
// Security: Unicode-aware regex allows accented chars (é, ñ, ü) for ES locale.
// Blocks XSS vectors: <, >, ", ', `, \, script tags, javascript: URIs.
// The regex uses Unicode property escapes (\p{L}\p{N}) — must have 'u' flag.
export const companionNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'errors.nameRequired' })
  .max(24, { message: 'errors.nameTooLong' })
  .regex(/^[\p{L}\p{N}\s'\-]+$/u, { message: 'errors.nameInvalidChars' }); // eslint-disable-line no-useless-escape
// What it allows: letters (any language), digits, spaces, apostrophes, hyphens
// What it blocks: <script>, HTML tags, JS injection, SQL operators, emoji

// ─── Companion state ──────────────────────────────────────────────────────────
export const companionStateSchema = z.object({
  id: z.string().uuid(),
  name: companionNameSchema,
  // .default('felis') preserves backward compat with pre-species localStorage data
  species: z.enum(['felis', 'spectra', 'dolcis', 'lumis']).default('felis'),
  nourishment: statValueSchema,
  joy: statValueSchema,
  energy: statValueSchema,
  vitality: statValueSchema,
  age: z.number().int().min(0),
  stage: z.enum(['seedling', 'sprout', 'bloom', 'flourish']),
  mood: z.enum(['radiant', 'calm', 'restless', 'weary', 'fragile', 'resting']),
  // NOTE: "dead" is intentionally absent — replaced by isInRestMode (R7)
  isResting: z.boolean(),
  isInRestMode: z.boolean(),
  createdAt: z.string().datetime(),
  lastUpdatedAt: z.string().datetime(),
});

// ─── Wellness milestone ───────────────────────────────────────────────────────
export const wellnessMilestoneSchema = z.object({
  companionName: companionNameSchema,
  longestStreak: z.number().int().min(0),
  achievedAt: z.string().datetime(),
});

// ─── App preferences ──────────────────────────────────────────────────────────
export const appPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  language: z.enum(['en', 'es']).default('en'),
  disclaimerAccepted: z.boolean().default(false),
});

// ─── Inferred TypeScript types (single source of truth) ──────────────────────
// These override the manual interfaces in types.ts where Zod is the validator.
export type CompanionState = z.infer<typeof companionStateSchema>;
export type WellnessMilestone = z.infer<typeof wellnessMilestoneSchema>;
export type AppPreferences = z.infer<typeof appPreferencesSchema>;
