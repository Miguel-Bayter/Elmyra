// Public API for entities/companion — only import from this file (R4)
export type {
  CompanionStage,
  CompanionMood,
  ActionType,
  CompanionStats,
  CompanionState as CompanionStateInterface,
  WellnessMilestone as WellnessMilestoneInterface,
  AppPreferences as AppPreferencesInterface,
} from './model/types';

export {
  companionNameSchema,
  companionStateSchema,
  wellnessMilestoneSchema,
  appPreferencesSchema,
  statValueSchema,
} from './model/schemas';
export type { CompanionState, WellnessMilestone, AppPreferences } from './model/schemas';

export {
  STORAGE_KEYS,
  GAME_TICK_MS,
  STAT_DECAY_PER_TICK,
  CRITICAL_THRESHOLD,
  VITALITY_DAMAGE_PER_TICK,
  ACTION_EFFECTS,
  STAGE_THRESHOLDS,
  MAX_OFFLINE_TICKS,
  ACTION_DEBOUNCE_MS,
  INITIAL_COMPANION_STATS,
  MOOD_THRESHOLDS,
} from './model/constants';

export {
  clampStat,
  clampStats,
  calculateMood,
  calculateStage,
  applyStatDecay,
  applyVitalityDamage,
  applyAction,
  checkRestMode,
  calculateOfflineDecay,
  generateCompanionId,
  getAffirmationIndex,
  createFreshCompanion,
} from './lib/companionCalculators';
