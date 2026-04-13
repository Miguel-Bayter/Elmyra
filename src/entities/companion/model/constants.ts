import type { ActionType, CompanionStage, CompanionStats } from './types';

// ─── Storage keys ─────────────────────────────────────────────────────────────
// All prefixed 'lumina_' — enables bulk deletion for right-to-erasure (R6)
export const STORAGE_KEYS = {
  COMPANION: 'lumina_companion',
  MILESTONE: 'lumina_milestone',
  PREFERENCES: 'lumina_preferences',
  DISCLAIMER_V: 'lumina_disclaimer_v1',
} as const;

// ─── Game loop timing ─────────────────────────────────────────────────────────
// 6s per tick — slightly slower than original Tamagotchi (4s)
// Rationale: less urgency = less anxiety for target users (R7)
export const GAME_TICK_MS = 6_000;

// ─── Stat decay per tick ──────────────────────────────────────────────────────
// Vitality does NOT decay on its own — only damaged when other stats are critical
export const STAT_DECAY_PER_TICK: Readonly<Record<keyof CompanionStats, number>> = {
  nourishment: -2,
  joy: -1.5,
  energy: -1,
  vitality: 0, // Vitality decays only via applyVitalityDamage()
};

// ─── Critical thresholds ──────────────────────────────────────────────────────
// Below CRITICAL_THRESHOLD: vitality starts decreasing (see applyVitalityDamage)
export const CRITICAL_THRESHOLD = 15;
export const VITALITY_DAMAGE_PER_TICK = 3;

// ─── Action effects ───────────────────────────────────────────────────────────
// Each action changes a subset of stats. Negative values = decrease.
// Balance: play costs energy/nourishment so user can't just play forever.
export const ACTION_EFFECTS: Readonly<Record<ActionType, Partial<CompanionStats>>> = {
  nourish: { nourishment: 30, joy: 5 },
  play: { joy: 25, energy: -15, nourishment: -5 },
  rest: { energy: 35, joy: -3 },
  comfort: { vitality: 25, joy: -8 },
};

// ─── Wellness stage thresholds (in ticks) ────────────────────────────────────
// Slower progression = less pressure (R7)
// seedling: 0–89 ticks (~9 min), sprout: 90–539 (~54 min),
// bloom: 540–2159 (~3.6h), flourish: 2160+ (~3.6h to reach)
export const STAGE_THRESHOLDS: Readonly<Record<CompanionStage, number>> = {
  seedling: 0,
  sprout: 90,
  bloom: 540,
  flourish: 2160,
};

// ─── Offline decay cap ───────────────────────────────────────────────────────
// Max ticks simulated when user returns after absence.
// Prevents punishing long absences — gentle return mechanic (R7, section 1.4)
export const MAX_OFFLINE_TICKS = 120; // ~12 minutes of decay max

// ─── Action debounce ─────────────────────────────────────────────────────────
// Prevents rapid button-clicking to exploit stat manipulation (R6)
export const ACTION_DEBOUNCE_MS = 800;

// ─── Initial stats ────────────────────────────────────────────────────────────
// High starting values = positive first experience
export const INITIAL_COMPANION_STATS: Readonly<CompanionStats> = {
  nourishment: 80,
  joy: 75,
  energy: 85,
  vitality: 100,
};

// ─── Mood thresholds ─────────────────────────────────────────────────────────
export const MOOD_THRESHOLDS = {
  RADIANT_MIN: 80, // All stats >= 80 → radiant
  RESTLESS_JOY: 20, // joy < 20 → restless
  WEARY_ENERGY: 15, // energy < 15 → weary
  FRAGILE_VITALITY: 15, // vitality < 15 → fragile
} as const;
