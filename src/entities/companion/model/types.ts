// STRICT ENGLISH — All identifiers in English (R1)
// These types mirror the Zod schemas in schemas.ts.
// Source of truth for TypeScript: schemas.ts (z.infer<>).
// This file provides human-readable interface definitions for documentation clarity.

export type CompanionStage = 'seedling' | 'sprout' | 'bloom' | 'flourish';

// The companion's species — determines its visual evolution line
export type CompanionSpecies = 'felis' | 'spectra' | 'dolcis' | 'lumis';

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
