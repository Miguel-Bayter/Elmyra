// Pure domain functions — NO side effects, NO React imports, NO browser APIs.
// All functions return new objects (immutable). Safe to call in tests without mocks.

import type { ActionType, CompanionMood, CompanionStage } from '../model/types';
import type { CompanionState } from '../model/schemas';
import {
  ACTION_EFFECTS,
  CRITICAL_THRESHOLD,
  GAME_TICK_MS,
  INITIAL_COMPANION_STATS,
  MAX_OFFLINE_TICKS,
  MOOD_THRESHOLDS,
  STAGE_THRESHOLDS,
  STAT_DECAY_PER_TICK,
  VITALITY_DAMAGE_PER_TICK,
} from '../model/constants';

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Clamps a single stat value to integer within [0, 100]. */
export const clampStat = (value: number): number => Math.round(Math.min(100, Math.max(0, value)));

/** Applies clampStat to all stat fields — returns a new CompanionState. */
export const clampStats = (state: CompanionState): CompanionState => ({
  ...state,
  nourishment: clampStat(state.nourishment),
  joy: clampStat(state.joy),
  energy: clampStat(state.energy),
  vitality: clampStat(state.vitality),
});

// ─── Mood derivation ──────────────────────────────────────────────────────────

/**
 * Derives the companion's mood from its current state.
 *
 * Priority order (highest first):
 * 1. resting  — companion is in rest mode (replaces "dead")
 * 2. fragile  — vitality is critically low
 * 3. weary    — energy is critically low
 * 4. restless — joy is very low (anxiety analog)
 * 5. radiant  — all stats are high
 * 6. calm     — default healthy state
 *
 * This priority ensures safety: rest mode always wins regardless of other stats.
 */
export const calculateMood = (state: CompanionState): CompanionMood => {
  if (state.isInRestMode) return 'resting';
  if (state.vitality < MOOD_THRESHOLDS.FRAGILE_VITALITY) return 'fragile';
  if (state.energy < MOOD_THRESHOLDS.WEARY_ENERGY) return 'weary';
  if (state.joy < MOOD_THRESHOLDS.RESTLESS_JOY) return 'restless';
  if (
    state.nourishment >= MOOD_THRESHOLDS.RADIANT_MIN &&
    state.joy >= MOOD_THRESHOLDS.RADIANT_MIN &&
    state.energy >= MOOD_THRESHOLDS.RADIANT_MIN &&
    state.vitality >= MOOD_THRESHOLDS.RADIANT_MIN
  ) {
    return 'radiant';
  }
  return 'calm';
};

// ─── Stage derivation ─────────────────────────────────────────────────────────

/**
 * Derives the companion's growth stage from its age in ticks.
 * Stages are reached at defined tick milestones (see STAGE_THRESHOLDS).
 */
export const calculateStage = (ageTicks: number): CompanionStage => {
  if (ageTicks >= STAGE_THRESHOLDS.flourish) return 'flourish';
  if (ageTicks >= STAGE_THRESHOLDS.bloom) return 'bloom';
  if (ageTicks >= STAGE_THRESHOLDS.sprout) return 'sprout';
  return 'seedling';
};

// ─── Stat decay ───────────────────────────────────────────────────────────────

/**
 * Applies one game tick of stat decay.
 * Stats decrease per STAT_DECAY_PER_TICK constants.
 * Age increments by 1 tick.
 * Returns a NEW object — original is not mutated.
 */
export const applyStatDecay = (state: CompanionState): CompanionState => {
  const now = new Date().toISOString();
  const decayed: CompanionState = {
    ...state,
    nourishment: clampStat(state.nourishment + STAT_DECAY_PER_TICK.nourishment),
    joy: clampStat(state.joy + STAT_DECAY_PER_TICK.joy),
    energy: clampStat(state.energy + STAT_DECAY_PER_TICK.energy),
    // vitality: decay handled separately by applyVitalityDamage
    age: state.age + 1,
    lastUpdatedAt: now,
  };
  return {
    ...decayed,
    stage: calculateStage(decayed.age),
  };
};

// ─── Vitality damage ──────────────────────────────────────────────────────────

/**
 * Damages vitality when any other stat is critically low (< CRITICAL_THRESHOLD).
 * Multiple critical stats stack damage per tick.
 * Returns a NEW object — original is not mutated.
 */
export const applyVitalityDamage = (state: CompanionState): CompanionState => {
  let damage = 0;
  if (state.nourishment < CRITICAL_THRESHOLD) damage += VITALITY_DAMAGE_PER_TICK;
  if (state.joy < CRITICAL_THRESHOLD) damage += VITALITY_DAMAGE_PER_TICK;
  if (state.energy < CRITICAL_THRESHOLD) damage += VITALITY_DAMAGE_PER_TICK;

  if (damage === 0) return state;

  return {
    ...state,
    vitality: clampStat(state.vitality - damage),
  };
};

// ─── Action application ───────────────────────────────────────────────────────

/**
 * Applies the effects of a user action on the companion.
 * All resulting stats are clamped to [0, 100].
 * Returns a NEW object — original is not mutated.
 */
export const applyAction = (state: CompanionState, action: ActionType): CompanionState => {
  // Safe: `action` is a typed union ('nourish'|'play'|'rest'|'comfort'), not user input.
  // eslint-disable-next-line security/detect-object-injection
  const effects = ACTION_EFFECTS[action];
  const updated: CompanionState = {
    ...state,
    nourishment: clampStat(state.nourishment + (effects.nourishment ?? 0)),
    joy: clampStat(state.joy + (effects.joy ?? 0)),
    energy: clampStat(state.energy + (effects.energy ?? 0)),
    vitality: clampStat(state.vitality + (effects.vitality ?? 0)),
    lastUpdatedAt: new Date().toISOString(),
  };
  return {
    ...updated,
    mood: calculateMood(updated),
  };
};

// ─── Rest mode check ──────────────────────────────────────────────────────────

/**
 * Returns true when vitality reaches 0.
 * NOTE: Never called "death" in identifiers or comments visible to users (R7).
 * The UI presents this as a peaceful "rest mode", not a failure state.
 */
export const checkRestMode = (state: CompanionState): boolean => state.vitality <= 0;

// ─── Offline decay ────────────────────────────────────────────────────────────

/**
 * Simulates N ticks of decay for time spent offline.
 * Capped at MAX_OFFLINE_TICKS — prevents punishing long absences (R7).
 * This is why users are NEVER shown "you abandoned your companion" messages.
 */
export const calculateOfflineDecay = (state: CompanionState, offlineMs: number): CompanionState => {
  const ticksElapsed = Math.floor(offlineMs / GAME_TICK_MS);
  const ticksToApply = Math.min(ticksElapsed, MAX_OFFLINE_TICKS);

  if (ticksToApply === 0) return state;

  let current = state;
  for (let i = 0; i < ticksToApply; i++) {
    current = applyStatDecay(current);
    current = applyVitalityDamage(current);
    // Stop early if rest mode triggers — no need to continue simulating
    if (checkRestMode(current)) {
      return {
        ...current,
        isInRestMode: true,
        mood: 'resting',
      };
    }
  }

  return {
    ...current,
    mood: calculateMood(current),
  };
};

// ─── ID generation ───────────────────────────────────────────────────────────

/** Generates a UUIDv4 via the Web Crypto API (available in all modern browsers). */
export const generateCompanionId = (): string => crypto.randomUUID();

// ─── Affirmation ─────────────────────────────────────────────────────────────

/**
 * Returns a deterministic affirmation index from a seed value.
 * Pure — no randomness in the function itself (seed comes from Date.now() at call site).
 */
export const getAffirmationIndex = (seed: number, totalAffirmations: number): number =>
  Math.abs(seed) % totalAffirmations;

// ─── Companion factory ───────────────────────────────────────────────────────

/**
 * Creates a fresh CompanionState from a validated name.
 * Called by useCreatePet feature hook — not directly in UI.
 */
export const createFreshCompanion = (name: string): CompanionState => {
  const now = new Date().toISOString();
  return {
    id: generateCompanionId(),
    name,
    ...INITIAL_COMPANION_STATS,
    age: 0,
    stage: 'seedling',
    mood: 'radiant',
    isResting: false,
    isInRestMode: false,
    createdAt: now,
    lastUpdatedAt: now,
  };
};
