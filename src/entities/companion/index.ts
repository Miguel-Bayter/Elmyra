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
export type { KawaiiAvatarProps } from './ui/KawaiiAvatar';
export { KawaiiAvatar } from './ui/KawaiiAvatar';

export {
  companionNameSchema,
  companionStateSchema,
  wellnessMilestoneSchema,
  appPreferencesSchema,
  streakSchema,
  statValueSchema,
  moodEntrySchema,
  journalSchema,
} from './model/schemas';
export type {
  CompanionState,
  WellnessMilestone,
  AppPreferences,
  StreakData,
  MoodEntry,
  Journal,
} from './model/schemas';

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
  KAWAII_SPECIES,
  MAX_OFFLINE_TICKS,
  ACTION_DEBOUNCE_MS,
  INITIAL_COMPANION_STATS,
  MOOD_THRESHOLDS,
  STREAK_MILESTONES,
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
