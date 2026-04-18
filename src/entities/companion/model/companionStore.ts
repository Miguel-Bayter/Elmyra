// Zustand store — global state for the companion domain.
// All mutations go through this store; components never modify state directly.
// Uses subscribeWithSelector so components can subscribe to slices without re-renders on every change.

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { ActionType, CompanionSpecies } from './types';
import type { AppPreferences, CompanionState, StreakData, WellnessMilestone } from './schemas';
import {
  appPreferencesSchema,
  companionStateSchema,
  streakSchema,
  wellnessMilestoneSchema,
} from './schemas';
import { companionNameSchema } from './schemas';
import { STORAGE_KEYS, STREAK_MILESTONES } from './constants';
import {
  applyAction,
  applyStatDecay,
  applyVitalityDamage,
  calculateMood,
  calculateOfflineDecay,
  checkRestMode,
  clampStats,
  createFreshCompanion,
} from '../lib/companionCalculators';
import { sanitizeCompanionName } from '@shared/lib/sanitize';
import { deleteAllAppData, readFromStorage, writeToStorage } from '@shared/lib/storage';

// ─── Notification callback type ───────────────────────────────────────────────
// Decoupled from i18n: store emits typed events, UI layer translates them.
export type StoreNotification =
  | { type: 'companionCreated'; name: string }
  | { type: 'companionRenamed'; name: string }
  | { type: 'restModeEntered'; name: string }
  | { type: 'restModeExited'; name: string }
  | { type: 'longAbsence'; name: string }
  | { type: 'dataDeleted' }
  | { type: 'actionSuccess'; action: ActionType; name: string }
  | { type: 'streakMilestone'; count: number };

export type NotificationHandler = (notification: StoreNotification) => void;

// ─── Default preferences ─────────────────────────────────────────────────────
const getSystemTheme = (): 'light' | 'dark' =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

// Detect browser language on first install — falls back to 'en'.
const getSystemLanguage = (): 'en' | 'es' => {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language ?? navigator.languages?.[0] ?? '';
  return lang.startsWith('es') ? 'es' : 'en';
};

// Infer a sensible default crisis country from browser locale — mirrors defaultCountryForLang.
const getSystemCrisisCountry = (): string => {
  if (typeof navigator === 'undefined') return 'US';
  const lang = navigator.language ?? navigator.languages?.[0] ?? '';
  return lang.startsWith('es') ? 'MX' : 'US';
};

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: getSystemTheme(),
  language: getSystemLanguage(),
  disclaimerAccepted: false,
  crisisCountry: getSystemCrisisCountry(),
  onboardingStep: 0,
};

// ─── Offline threshold for "long absence" nudge ───────────────────────────────
// If user was away more than 5 minutes, show a gentle return greeting.
const LONG_ABSENCE_MS = 5 * 60 * 1000;

// ─── Store interface ──────────────────────────────────────────────────────────

export interface CompanionStore {
  companion: CompanionState | null;
  milestone: WellnessMilestone | null;
  streak: StreakData;
  preferences: AppPreferences;
  isLoading: boolean;

  // Notification handler — set by UI layer (widget/provider)
  _notificationHandler: NotificationHandler | null;
  setNotificationHandler: (handler: NotificationHandler) => void;

  // ── Lifecycle ────────────────────────────────────────────────────────────
  initializeCompanion: (name: string, species: CompanionSpecies) => void;
  loadFromStorage: () => void;
  resetCompanion: () => void;
  deleteAllData: () => void;

  // ── Game loop ────────────────────────────────────────────────────────────
  tickGameLoop: () => void;

  // ── User actions ─────────────────────────────────────────────────────────
  performAction: (action: ActionType) => void;
  renameCompanion: (newName: string) => void;
  wakeFromRestMode: () => void; // Gently revives companion from rest mode (R7)

  // ── Preferences ──────────────────────────────────────────────────────────
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'en' | 'es') => void;
  advanceOnboarding: () => void;
  acceptDisclaimer: () => void;
  setCrisisCountry: (code: string) => void;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Saves companion to localStorage if non-null. */
const persistCompanion = (companion: CompanionState | null): void => {
  if (companion) writeToStorage(STORAGE_KEYS.COMPANION, companion);
};

/** Saves preferences to localStorage. */
const persistPreferences = (preferences: AppPreferences): void => {
  writeToStorage(STORAGE_KEYS.PREFERENCES, preferences);
};

/** Updates or creates a WellnessMilestone based on companion age. */
const updateMilestone = (
  current: WellnessMilestone | null,
  companion: CompanionState,
): WellnessMilestone => {
  if (!current || companion.age > current.longestStreak) {
    const milestone: WellnessMilestone = {
      companionName: companion.name,
      longestStreak: companion.age,
      achievedAt: new Date().toISOString(),
    };
    writeToStorage(STORAGE_KEYS.MILESTONE, milestone);
    return milestone;
  }
  return current;
};

/** Returns today's date as YYYY-MM-DD in local time. */
const todayString = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Computes new streak from stored data and today's date. Returns updated StreakData. */
const computeStreak = (stored: StreakData): StreakData => {
  const today = todayString();
  if (stored.lastActiveDate === today) return stored; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const newCount = stored.lastActiveDate === yStr ? stored.count + 1 : 1;
  return { count: newCount, lastActiveDate: today };
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCompanionStore = create<CompanionStore>()(
  subscribeWithSelector((set, get) => ({
    companion: null,
    milestone: null,
    streak: { count: 0, lastActiveDate: '' },
    preferences: DEFAULT_PREFERENCES,
    isLoading: false,
    _notificationHandler: null,

    setNotificationHandler: (handler) => {
      set({ _notificationHandler: handler });
    },

    // ── Lifecycle ──────────────────────────────────────────────────────────

    initializeCompanion: (name, species) => {
      const sanitized = sanitizeCompanionName(name);
      const parseResult = companionNameSchema.safeParse(sanitized);
      if (!parseResult.success) return; // Validation failure — caller handles error display

      const companion = createFreshCompanion(parseResult.data, species);
      persistCompanion(companion);

      set({ companion });
      get()._notificationHandler?.({ type: 'companionCreated', name: companion.name });
    },

    loadFromStorage: () => {
      set({ isLoading: true });

      const storedCompanion = readFromStorage(STORAGE_KEYS.COMPANION, companionStateSchema);
      const storedMilestone = readFromStorage(STORAGE_KEYS.MILESTONE, wellnessMilestoneSchema);
      const storedPreferences = readFromStorage(STORAGE_KEYS.PREFERENCES, appPreferencesSchema);

      const preferences = storedPreferences ?? { ...DEFAULT_PREFERENCES, theme: getSystemTheme() };

      // Sync data-theme attribute so CSS vars match the loaded/detected preference
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['theme'] = preferences.theme;
      }

      // ── Streak computation ──────────────────────────────────────────────
      const storedStreak = readFromStorage(STORAGE_KEYS.STREAK, streakSchema);
      const prevStreak = storedStreak ?? { count: 0, lastActiveDate: '' };
      const newStreak = computeStreak(prevStreak);
      if (newStreak.lastActiveDate !== prevStreak.lastActiveDate) {
        writeToStorage(STORAGE_KEYS.STREAK, newStreak);
        // Fire milestone toast if count hits a milestone day
        if ((STREAK_MILESTONES as readonly number[]).includes(newStreak.count)) {
          get()._notificationHandler?.({ type: 'streakMilestone', count: newStreak.count });
        }
      }

      if (!storedCompanion) {
        set({
          companion: null,
          milestone: storedMilestone,
          streak: newStreak,
          preferences,
          isLoading: false,
        });
        return;
      }

      // Apply offline decay based on time elapsed since last update
      const now = Date.now();
      const lastUpdated = new Date(storedCompanion.lastUpdatedAt).getTime();
      const offlineMs = now - lastUpdated;

      const decayedCompanion = calculateOfflineDecay(storedCompanion, offlineMs);
      persistCompanion(decayedCompanion);

      const milestone = updateMilestone(storedMilestone, decayedCompanion);

      set({
        companion: decayedCompanion,
        milestone,
        streak: newStreak,
        preferences,
        isLoading: false,
      });

      // Gentle return greeting if user was away a while (R7 — no guilt, just warmth)
      if (offlineMs >= LONG_ABSENCE_MS) {
        get()._notificationHandler?.({ type: 'longAbsence', name: decayedCompanion.name });
      }
    },

    resetCompanion: () => {
      set({ companion: null });
    },

    deleteAllData: () => {
      deleteAllAppData();
      set({
        companion: null,
        milestone: null,
        preferences: DEFAULT_PREFERENCES,
        isLoading: false,
      });
      get()._notificationHandler?.({ type: 'dataDeleted' });
    },

    // ── Game loop ────────────────────────────────────────────────────────────

    tickGameLoop: () => {
      const { companion, milestone } = get();

      // Guard: do not tick if no companion, or if paused states
      if (!companion || companion.isResting || companion.isInRestMode) return;

      // Step 1: apply stat decay
      let next = applyStatDecay(companion);
      // Step 2: damage vitality if any stat is critical
      next = applyVitalityDamage(next);

      // Step 3: check if rest mode should trigger
      if (checkRestMode(next)) {
        next = {
          ...next,
          vitality: 0,
          isInRestMode: true,
          mood: 'resting',
          // stage already set correctly by applyStatDecay (calculateStageForSpecies)
        };
        persistCompanion(next);
        const updatedMilestone = updateMilestone(milestone, next);
        set({ companion: next, milestone: updatedMilestone });
        get()._notificationHandler?.({ type: 'restModeEntered', name: next.name });
        return;
      }

      // Step 4: update derived fields
      // stage is already correct from applyStatDecay (uses calculateStageForSpecies)
      next = {
        ...next,
        mood: calculateMood(next),
      };
      next = clampStats(next);

      persistCompanion(next);
      const updatedMilestone = updateMilestone(milestone, next);
      set({ companion: next, milestone: updatedMilestone });
    },

    // ── User actions ──────────────────────────────────────────────────────────

    performAction: (action) => {
      const { companion } = get();
      if (!companion || companion.isResting || companion.isInRestMode) return;

      const next = applyAction(companion, action);
      persistCompanion(next);
      set({ companion: next });
      get()._notificationHandler?.({ type: 'actionSuccess', action, name: next.name });
    },

    wakeFromRestMode: () => {
      const { companion } = get();
      if (!companion || !companion.isInRestMode) return;

      const now = new Date().toISOString();
      const revived: CompanionState = {
        ...companion,
        vitality: 30, // Gentle revival — not full health (R7: no punishment, no instant reward)
        isInRestMode: false,
        mood: 'calm',
        lastUpdatedAt: now,
      };
      persistCompanion(revived);
      set({ companion: revived });
      get()._notificationHandler?.({ type: 'restModeExited', name: revived.name });
    },

    renameCompanion: (newName) => {
      const { companion } = get();
      if (!companion) return;

      const sanitized = sanitizeCompanionName(newName);
      const parseResult = companionNameSchema.safeParse(sanitized);
      if (!parseResult.success) return;

      const next: CompanionState = {
        ...companion,
        name: parseResult.data,
        lastUpdatedAt: new Date().toISOString(),
      };
      persistCompanion(next);
      set({ companion: next });
      get()._notificationHandler?.({ type: 'companionRenamed', name: next.name });
    },

    // ── Preferences ───────────────────────────────────────────────────────────

    setTheme: (theme) => {
      const preferences: AppPreferences = { ...get().preferences, theme };
      persistPreferences(preferences);
      set({ preferences });
    },

    setLanguage: (lang) => {
      const preferences: AppPreferences = { ...get().preferences, language: lang };
      persistPreferences(preferences);
      set({ preferences });
    },

    acceptDisclaimer: () => {
      const preferences: AppPreferences = { ...get().preferences, disclaimerAccepted: true };
      persistPreferences(preferences);
      set({ preferences });
    },

    setCrisisCountry: (code) => {
      const preferences: AppPreferences = { ...get().preferences, crisisCountry: code };
      persistPreferences(preferences);
      set({ preferences });
    },

    advanceOnboarding: () => {
      const { preferences } = get();
      const current = preferences.onboardingStep;
      if (current === 'done') return;
      const next = current < 2 ? ((current + 1) as 0 | 1 | 2) : 'done';
      const updated: AppPreferences = { ...preferences, onboardingStep: next };
      persistPreferences(updated);
      set({ preferences: updated });
    },
  })),
);
