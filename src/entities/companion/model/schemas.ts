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

// ─── Interaction counts ───────────────────────────────────────────────────────
// Tracks cumulative action counts since companion creation.
// z.preprocess fills in missing field from old localStorage saves (backward compat)
// without making the TypeScript type optional.
const ZERO_COUNTS = { nourish: 0, play: 0, rest: 0, comfort: 0 } as const;

export const interactionCountsSchema = z.object({
  nourish: z.number().int().min(0),
  play: z.number().int().min(0),
  rest: z.number().int().min(0),
  comfort: z.number().int().min(0),
});

// Used as a field schema: replaces absent/null with zeros so old saves stay valid.
const interactionCountsField = z.preprocess(
  (val) => (val == null ? ZERO_COUNTS : val),
  interactionCountsSchema,
);

// ─── Companion state ──────────────────────────────────────────────────────────
export const companionStateSchema = z.object({
  id: z.string().uuid(),
  name: companionNameSchema,
  // .default('zephyr') preserves backward compat with pre-species localStorage data
  // 3D: zephyr, kova, luma, maru — 2D kawaii: nimbus, boba, mochi, nuri
  species: z
    .enum(['zephyr', 'kova', 'luma', 'maru', 'nimbus', 'boba', 'mochi', 'nuri'])
    .default('zephyr'),
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
  // Backward compat: absent in old saves → preprocessed to zeros
  interactionCounts: interactionCountsField,
});

// ─── Wellness milestone ───────────────────────────────────────────────────────
export const wellnessMilestoneSchema = z.object({
  companionName: companionNameSchema,
  longestStreak: z.number().int().min(0),
  achievedAt: z.string().datetime(),
});

// ─── Daily streak ─────────────────────────────────────────────────────────────
// Tracks consecutive days of engagement — persisted separately from companion.
export const streakSchema = z.object({
  count: z.number().int().min(0).default(0),
  lastActiveDate: z.string().default(''), // YYYY-MM-DD
});

// ─── App preferences ──────────────────────────────────────────────────────────
export const appPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  language: z.enum(['en', 'es']).default('en'),
  disclaimerAccepted: z.boolean().default(false),
  crisisCountry: z.string().default('us'),
  // Onboarding step — 0/1/2 = in progress, 'done' = completed
  onboardingStep: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal('done')]).default(0),
});

// ─── Inferred TypeScript types (single source of truth) ──────────────────────
// These override the manual interfaces in types.ts where Zod is the validator.
export type CompanionState = z.infer<typeof companionStateSchema>;
export type WellnessMilestone = z.infer<typeof wellnessMilestoneSchema>;
export type AppPreferences = z.infer<typeof appPreferencesSchema>;
export type StreakData = z.infer<typeof streakSchema>;
