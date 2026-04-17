// Public API for entities/companion — only import from this file (R4)
export type {
  CompanionStage,
  CompanionMood,
  CompanionSpecies,
  ActionType,
  CompanionStats,
  CompanionState as CompanionStateInterface,
  WellnessMilestone as WellnessMilestoneInterface,
  AppPreferences as AppPreferencesInterface,
  InteractionCounts,
  EvolutionAffinity,
} from './model/types';

export type { SpeciesStageConfig, SpeciesConfig } from './model/species';
export { SPECIES_CONFIG, getSpeciesStageConfig } from './model/species';

export type { CompanionAvatarProps } from './ui/CompanionAvatar';
export { CompanionAvatar } from './ui/CompanionAvatar';

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
  INTERACTION_BOOST_WEIGHT,
  SPECIES_PRIMARY_ACTION,
  MAX_OFFLINE_TICKS,
  ACTION_DEBOUNCE_MS,
  INITIAL_COMPANION_STATS,
  MOOD_THRESHOLDS,
} from './model/constants';

export type {
  CompanionStore,
  StoreNotification,
  NotificationHandler,
} from './model/companionStore';
export { useCompanionStore } from './model/companionStore';

export {
  clampStat,
  clampStats,
  calculateMood,
  calculateStage,
  calculateStageForSpecies,
  getEvolutionAffinity,
  applyStatDecay,
  applyVitalityDamage,
  applyAction,
  checkRestMode,
  calculateOfflineDecay,
  generateCompanionId,
  getAffirmationIndex,
  createFreshCompanion,
} from './lib/companionCalculators';
