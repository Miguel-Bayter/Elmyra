// STRICT ENGLISH — All identifiers in English (R1)
// These types mirror the Zod schemas in schemas.ts.
// Source of truth for TypeScript: schemas.ts (z.infer<>).
// This file provides human-readable interface definitions for documentation clarity.

export type CompanionStage = 'seedling' | 'sprout' | 'bloom' | 'flourish';

// The companion's species — determines its visual evolution line.
// 3D species (React Three Fiber): zephyr, kova, luma, maru
// 2D species (react-kawaii flat): nimbus, boba, mochi, nuri
export type CompanionSpecies =
  | 'zephyr' // Cloud/breath — releases anxiety through breathing (3D)
  | 'kova' // Stone/earth  — grounds through stability (3D)
  | 'luma' // Glow/light   — nurtures hope against depression (3D)
  | 'maru' // Ring/moon    — embodies wholeness and acceptance (3D)
  | 'nimbus' // Dream/wisp   — teaches lightness and flow (2D)
  | 'boba' // Cosmic orb   — calm and infinite perspective (2D)
  | 'mochi' // Soft warmth  — gentle comfort and sweetness (2D)
  | 'nuri'; // Curious cat  — playful presence, joy in small things (2D)

// ─── Interaction tracking ─────────────────────────────────────────────────────
// Counts how many times each action has been performed since the companion was created.
// Used to boost evolution speed for new species and to derive EvolutionAffinity.
export interface InteractionCounts {
  readonly nourish: number;
  readonly play: number;
  readonly rest: number;
  readonly comfort: number;
}

// ─── Evolution affinity ────────────────────────────────────────────────────────
// The dominant care pattern — drives visual variations in the new 3D species.
// 'balanced' when no action type is clearly dominant (< 40 % share).
export type EvolutionAffinity = 'nourish' | 'play' | 'rest' | 'comfort' | 'balanced';

// Mood names chosen for wellness tone — no negative clinical terms (R7)
export type CompanionMood =
  | 'radiant' //   All stats high (80+)
  | 'calm' //      Stats okay (no stat below 30)
  | 'restless' //  Low joy (<20) — maps to low mood / anxiety analog
  | 'weary' //     Low energy (<15)
  | 'fragile' //   Low vitality (<15)
  | 'resting'; //  In rest mode — replaces "dead" (R7, section 1.4)

export type ActionType = 'nourish' | 'play' | 'rest' | 'comfort';

export interface CompanionStats {
  readonly nourishment: number; // 0 = needs food, 100 = fully nourished
  readonly joy: number; //        0 = very low mood, 100 = joyful
  readonly energy: number; //     0 = exhausted, 100 = energized
  readonly vitality: number; //   0 = rest mode triggers, 100 = thriving
}

export interface CompanionState extends CompanionStats {
  readonly id: string; //          UUIDv4
  readonly name: string; //        Validated by companionNameSchema (1-24 chars)
  readonly species: CompanionSpecies; // Visual evolution line chosen at creation
  readonly age: number; //         In game-ticks (not real time)
  readonly stage: CompanionStage;
  readonly mood: CompanionMood;
  readonly isResting: boolean; //     User-initiated rest (sleeping)
  readonly isInRestMode: boolean; //  Critical state — replaces "death" (R7)
  readonly createdAt: string; //      ISO 8601 datetime
  readonly lastUpdatedAt: string; //  ISO 8601 datetime
}

export interface WellnessMilestone {
  readonly companionName: string;
  readonly longestStreak: number; // Longest continuous ticks alive
  readonly achievedAt: string; //   ISO 8601 datetime
}

export interface AppPreferences {
  readonly theme: 'light' | 'dark';
  readonly language: 'en' | 'es';
  readonly disclaimerAccepted: boolean;
}
