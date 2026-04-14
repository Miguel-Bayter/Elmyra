// Zustand store — global state for the companion domain.
// All mutations go through this store; components never modify state directly.
// Uses subscribeWithSelector so components can subscribe to slices without re-renders on every change.

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { ActionType } from './types';
import type { AppPreferences, CompanionState, WellnessMilestone } from './schemas';
import { appPreferencesSchema, companionStateSchema, wellnessMilestoneSchema } from './schemas';
import { companionNameSchema } from './schemas';
import { STORAGE_KEYS } from './constants';
import {
  applyAction,
  applyStatDecay,
  applyVitalityDamage,
  calculateMood,
  calculateOfflineDecay,
  calculateStage,
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
  | { type: 'actionSuccess'; action: ActionType; name: string };

export type NotificationHandler = (notification: StoreNotification) => void;

// ─── Default preferences ─────────────────────────────────────────────────────
const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'light',
  language: 'en',
  disclaimerAccepted: false,
};

// ─── Offline threshold for "long absence" nudge ───────────────────────────────
// If user was away more than 5 minutes, show a gentle return greeting.
const LONG_ABSENCE_MS = 5 * 60 * 1000;

// ─── Store interface ──────────────────────────────────────────────────────────

export interface CompanionStore {
  companion: CompanionState | null;
  milestone: WellnessMilestone | null;
  preferences: AppPreferences;
  isLoading: boolean;

  // Notification handler — set by UI layer (widget/provider)
  _notificationHandler: NotificationHandler | null;
  setNotificationHandler: (handler: NotificationHandler) => void;

  // ── Lifecycle ────────────────────────────────────────────────────────────
  initializeCompanion: (name: string) => void;
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
  acceptDisclaimer: () => void;
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

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCompanionStore = create<CompanionStore>()(
  subscribeWithSelector((set, get) => ({
    companion: null,
    milestone: null,
    preferences: DEFAULT_PREFERENCES,
    isLoading: false,
    _notificationHandler: null,

    setNotificationHandler: (handler) => {
      set({ _notificationHandler: handler });
    },

    // ── Lifecycle ──────────────────────────────────────────────────────────

    initializeCompanion: (name) => {
      const sanitized = sanitizeCompanionName(name);
      const parseResult = companionNameSchema.safeParse(sanitized);
      if (!parseResult.success) return; // Validation failure — caller handles error display

      const companion = createFreshCompanion(parseResult.data);
      persistCompanion(companion);

      set({ companion });
      get()._notificationHandler?.({ type: 'companionCreated', name: companion.name });
    },

    loadFromStorage: () => {
      set({ isLoading: true });

      const storedCompanion = readFromStorage(STORAGE_KEYS.COMPANION, companionStateSchema);
      const storedMilestone = readFromStorage(STORAGE_KEYS.MILESTONE, wellnessMilestoneSchema);
      const storedPreferences = readFromStorage(STORAGE_KEYS.PREFERENCES, appPreferencesSchema);

      const preferences = storedPreferences ?? DEFAULT_PREFERENCES;

      if (!storedCompanion) {
        set({ companion: null, milestone: storedMilestone, preferences, isLoading: false });
        return;
      }

      // Apply offline decay based on time elapsed since last update
      const now = Date.now();
      const lastUpdated = new Date(storedCompanion.lastUpdatedAt).getTime();
      const offlineMs = now - lastUpdated;

      const decayedCompanion = calculateOfflineDecay(storedCompanion, offlineMs);
      persistCompanion(decayedCompanion);

      const milestone = updateMilestone(storedMilestone, decayedCompanion);

      set({ companion: decayedCompanion, milestone, preferences, isLoading: false });

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
          stage: calculateStage(next.age),
        };
        persistCompanion(next);
        const updatedMilestone = updateMilestone(milestone, next);
        set({ companion: next, milestone: updatedMilestone });
        get()._notificationHandler?.({ type: 'restModeEntered', name: next.name });
        return;
      }

      // Step 4: update derived fields
      next = {
        ...next,
        mood: calculateMood(next),
        stage: calculateStage(next.age),
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
  })),
);
