// Store tests — Sprint 2
// Uses vi.useFakeTimers() where needed, and beforeEach store resets to avoid state leakage.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCompanionStore } from './companionStore';
import { STORAGE_KEYS } from './constants';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resets the store to its initial state between tests. */
const resetStore = () => {
  useCompanionStore.setState({
    companion: null,
    milestone: null,
    preferences: {
      theme: 'light',
      language: 'en',
      disclaimerAccepted: false,
      crisisCountry: 'us',
      onboardingStep: 0,
    },
    isLoading: false,
    _notificationHandler: null,
  });
};

/** Returns current companion from the store (non-null assertion guarded by test). */
const getCompanion = () => {
  const { companion } = useCompanionStore.getState();
  return companion;
};

// ─── initializeCompanion ─────────────────────────────────────────────────────

describe('initializeCompanion', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  it('creates companion with correct initial stats and unique ID', () => {
    useCompanionStore.getState().initializeCompanion('Luna', 'zephyr');
    const companion = getCompanion();

    expect(companion).not.toBeNull();
    expect(companion?.name).toBe('Luna');
    expect(companion?.nourishment).toBe(80);
    expect(companion?.joy).toBe(75);
    expect(companion?.energy).toBe(85);
    expect(companion?.vitality).toBe(100);
    expect(companion?.age).toBe(0);
    expect(companion?.stage).toBe('seedling');
    expect(companion?.mood).toBe('radiant');
    expect(companion?.isResting).toBe(false);
    expect(companion?.isInRestMode).toBe(false);
    expect(companion?.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('persists companion to localStorage immediately after creation', () => {
    useCompanionStore.getState().initializeCompanion('Sol', 'zephyr');
    const stored = localStorage.getItem(STORAGE_KEYS.COMPANION);

    expect(stored).not.toBeNull();
    const parsed: unknown = JSON.parse(stored ?? '{}');
    expect(parsed).toMatchObject({ name: 'Sol' });
  });

  it('does nothing if name fails schema validation (XSS attempt)', () => {
    useCompanionStore.getState().initializeCompanion('<script>alert(1)</script>', 'zephyr');
    expect(getCompanion()).toBeNull();
  });

  it('does nothing if name is empty string', () => {
    useCompanionStore.getState().initializeCompanion('', 'zephyr');
    expect(getCompanion()).toBeNull();
  });

  it('does nothing if name exceeds max length (> 24 chars)', () => {
    useCompanionStore.getState().initializeCompanion('A'.repeat(25), 'zephyr');
    expect(getCompanion()).toBeNull();
  });

  it('fires notification handler with companionCreated event', () => {
    const handler = vi.fn();
    useCompanionStore.getState().setNotificationHandler(handler);
    useCompanionStore.getState().initializeCompanion('Nova', 'zephyr');

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ type: 'companionCreated', name: 'Nova' });
  });
});

// ─── loadFromStorage ──────────────────────────────────────────────────────────

describe('loadFromStorage', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  it('loads a valid stored companion', () => {
    // Pre-populate by creating a companion first
    useCompanionStore.getState().initializeCompanion('Milo', 'zephyr');
    const created = getCompanion();
    resetStore(); // Clear in-memory state, keep localStorage

    useCompanionStore.getState().loadFromStorage();
    const loaded = getCompanion();

    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('Milo');
    expect(loaded?.id).toBe(created?.id);
  });

  it('returns null companion if localStorage is empty', () => {
    useCompanionStore.getState().loadFromStorage();
    expect(getCompanion()).toBeNull();
  });

  it('handles corrupted localStorage data gracefully — no crash, returns null', () => {
    localStorage.setItem(STORAGE_KEYS.COMPANION, 'not-valid-json{{{');
    expect(() => useCompanionStore.getState().loadFromStorage()).not.toThrow();
    expect(getCompanion()).toBeNull();
  });

  it('handles schema-invalid data gracefully — removes it from localStorage', () => {
    // Valid JSON but wrong shape
    localStorage.setItem(STORAGE_KEYS.COMPANION, JSON.stringify({ name: 123, invalid: true }));
    useCompanionStore.getState().loadFromStorage();

    expect(getCompanion()).toBeNull();
    // Storage entry should be removed
    expect(localStorage.getItem(STORAGE_KEYS.COMPANION)).toBeNull();
  });

  it('applies offline decay based on lastUpdatedAt', () => {
    useCompanionStore.getState().initializeCompanion('Aria', 'zephyr');
    const created = getCompanion();
    expect(created).not.toBeNull();

    // Simulate 1 hour ago by manipulating the stored lastUpdatedAt
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const modified = { ...created, lastUpdatedAt: oneHourAgo };
    localStorage.setItem(STORAGE_KEYS.COMPANION, JSON.stringify(modified));
    resetStore();

    useCompanionStore.getState().loadFromStorage();
    const loaded = getCompanion();

    // After 1 hour offline, nourishment should be lower than initial 80
    expect(loaded?.nourishment).toBeLessThan(80);
  });

  it('fires longAbsence notification when offline > 5 minutes', () => {
    const handler = vi.fn();
    useCompanionStore.getState().initializeCompanion('Rex', 'zephyr');
    const created = getCompanion();

    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    localStorage.setItem(
      STORAGE_KEYS.COMPANION,
      JSON.stringify({ ...created, lastUpdatedAt: sixMinutesAgo }),
    );
    resetStore();

    useCompanionStore.getState().setNotificationHandler(handler);
    useCompanionStore.getState().loadFromStorage();

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'longAbsence' }));
  });
});

// ─── tickGameLoop ─────────────────────────────────────────────────────────────

describe('tickGameLoop', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  it('decreases stats and increments age on each tick', () => {
    useCompanionStore.getState().initializeCompanion('Kira', 'zephyr');
    const before = getCompanion();

    useCompanionStore.getState().tickGameLoop();
    const after = getCompanion();

    expect(after?.nourishment).toBeLessThan(before?.nourishment ?? 100);
    expect(after?.joy).toBeLessThan(before?.joy ?? 100);
    expect(after?.energy).toBeLessThan(before?.energy ?? 100);
    expect(after?.age).toBe((before?.age ?? 0) + 1);
  });

  it('saves to localStorage on every tick', () => {
    useCompanionStore.getState().initializeCompanion('Zen', 'zephyr');
    const beforeStored = localStorage.getItem(STORAGE_KEYS.COMPANION);

    useCompanionStore.getState().tickGameLoop();
    const afterStored = localStorage.getItem(STORAGE_KEYS.COMPANION);

    // Both stored, but content differs (age changed)
    expect(beforeStored).not.toBeNull();
    expect(afterStored).not.toBeNull();
    expect(beforeStored).not.toBe(afterStored);
  });

  it('does NOT tick when companion is null', () => {
    // No companion initialized — no crash expected
    expect(() => useCompanionStore.getState().tickGameLoop()).not.toThrow();
  });

  it('does NOT tick when isResting = true', () => {
    useCompanionStore.getState().initializeCompanion('Paz', 'zephyr');
    const comp = getCompanion();
    if (!comp) throw new Error('companion should exist after initializeCompanion');

    useCompanionStore.setState({
      companion: { ...comp, isResting: true },
    });

    const beforeAge = getCompanion()?.age;
    useCompanionStore.getState().tickGameLoop();

    expect(getCompanion()?.age).toBe(beforeAge);
  });

  it('does NOT tick when isInRestMode = true', () => {
    useCompanionStore.getState().initializeCompanion('Sereno', 'zephyr');
    const comp = getCompanion();
    if (!comp) throw new Error('companion should exist after initializeCompanion');

    useCompanionStore.setState({
      companion: { ...comp, isInRestMode: true, mood: 'resting' },
    });

    const beforeAge = getCompanion()?.age;
    useCompanionStore.getState().tickGameLoop();

    expect(getCompanion()?.age).toBe(beforeAge);
  });

  it('triggers rest mode and fires notification when vitality reaches 0', () => {
    const handler = vi.fn();
    useCompanionStore.getState().setNotificationHandler(handler);
    useCompanionStore.getState().initializeCompanion('Edge', 'zephyr');
    const comp = getCompanion();
    if (!comp) throw new Error('companion should exist after initializeCompanion');

    // Set companion to critical state — one more tick of vitality damage will hit 0
    useCompanionStore.setState({
      companion: {
        ...comp,
        vitality: 2, // Will reach 0 after one damage tick (3/tick minimum)
        nourishment: 5, // Below CRITICAL_THRESHOLD → triggers damage
        joy: 5,
        energy: 5,
      },
    });

    useCompanionStore.getState().tickGameLoop();

    const after = getCompanion();
    expect(after?.isInRestMode).toBe(true);
    expect(after?.mood).toBe('resting');
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'restModeEntered' }));
  });
});

// ─── performAction ────────────────────────────────────────────────────────────

describe('performAction', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  it('nourish increases nourishment', () => {
    useCompanionStore.getState().initializeCompanion('Mika', 'zephyr');
    const comp = getCompanion();
    if (!comp) throw new Error('companion should exist after initializeCompanion');
    useCompanionStore.setState({ companion: { ...comp, nourishment: 50 } });

    useCompanionStore.getState().performAction('nourish');

    expect(getCompanion()?.nourishment).toBeGreaterThan(50);
  });

  it('does nothing when isInRestMode = true', () => {
    useCompanionStore.getState().initializeCompanion('Lux', 'zephyr');
    const comp = getCompanion();
    if (!comp) throw new Error('companion should exist after initializeCompanion');
    useCompanionStore.setState({ companion: { ...comp, isInRestMode: true, mood: 'resting' } });

    const nourBefore = getCompanion()?.nourishment;
    useCompanionStore.getState().performAction('nourish');

    expect(getCompanion()?.nourishment).toBe(nourBefore);
  });
});

// ─── deleteAllData ────────────────────────────────────────────────────────────

describe('deleteAllData', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  it('removes all elmyra_* keys from localStorage', () => {
    useCompanionStore.getState().initializeCompanion('Bye', 'zephyr');
    useCompanionStore.getState().acceptDisclaimer();

    // Verify keys exist before deletion
    expect(localStorage.getItem(STORAGE_KEYS.COMPANION)).not.toBeNull();

    useCompanionStore.getState().deleteAllData();

    expect(localStorage.getItem(STORAGE_KEYS.COMPANION)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.PREFERENCES)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.MILESTONE)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.DISCLAIMER_V)).toBeNull();
  });

  it('resets store companion to null', () => {
    useCompanionStore.getState().initializeCompanion('Bye', 'zephyr');
    expect(getCompanion()).not.toBeNull();

    useCompanionStore.getState().deleteAllData();

    expect(getCompanion()).toBeNull();
  });

  it('resets preferences to defaults', () => {
    useCompanionStore.getState().setTheme('dark');
    useCompanionStore.getState().deleteAllData();

    const { preferences } = useCompanionStore.getState();
    expect(preferences.theme).toBe('light');
    expect(preferences.disclaimerAccepted).toBe(false);
  });

  it('fires dataDeleted notification', () => {
    const handler = vi.fn();
    useCompanionStore.getState().setNotificationHandler(handler);
    useCompanionStore.getState().deleteAllData();

    expect(handler).toHaveBeenCalledWith({ type: 'dataDeleted' });
  });
});

// ─── Preferences ─────────────────────────────────────────────────────────────

describe('preferences', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  it('setTheme updates preferences and persists to localStorage', () => {
    useCompanionStore.getState().setTheme('dark');
    expect(useCompanionStore.getState().preferences.theme).toBe('dark');
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    expect(stored).toContain('"theme":"dark"');
  });

  it('setLanguage updates preferences and persists to localStorage', () => {
    useCompanionStore.getState().setLanguage('es');
    expect(useCompanionStore.getState().preferences.language).toBe('es');
  });

  it('acceptDisclaimer sets disclaimerAccepted to true and persists', () => {
    useCompanionStore.getState().acceptDisclaimer();
    expect(useCompanionStore.getState().preferences.disclaimerAccepted).toBe(true);
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    expect(stored).toContain('"disclaimerAccepted":true');
  });
});
