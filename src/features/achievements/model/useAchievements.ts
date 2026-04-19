import { useState, useEffect, useCallback } from 'react';
import type { CompanionState, StreakData, MoodEntry } from '@entities/companion';

export type AchievementId =
  | 'first_action'
  | 'streak_7'
  | 'streak_30'
  | 'all_actions'
  | 'evolution_1'
  | 'evolution_max'
  | 'breathing_5'
  | 'journal_7';

export const ACHIEVEMENT_EMOJIS: Record<AchievementId, string> = {
  first_action: '🌱',
  streak_7: '🔥',
  streak_30: '🌕',
  all_actions: '⭐',
  evolution_1: '🌿',
  evolution_max: '✨',
  breathing_5: '🌬️',
  journal_7: '📖',
};

export const ALL_ACHIEVEMENT_IDS: AchievementId[] = [
  'first_action',
  'streak_7',
  'streak_30',
  'all_actions',
  'evolution_1',
  'evolution_max',
  'breathing_5',
  'journal_7',
];

interface UnlockedRecord {
  id: AchievementId;
  unlockedAt: string;
}

export interface AchievementStatus {
  id: AchievementId;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string | undefined;
}

const STORAGE_KEY = 'elmyra_achievements';
export const BREATHING_KEY = 'elmyra_breathing_count';

function loadUnlocked(): Map<AchievementId, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as UnlockedRecord[];
    return new Map(parsed.map((r) => [r.id, r.unlockedAt]));
  } catch {
    return new Map();
  }
}

function persistUnlocked(map: Map<AchievementId, string>): void {
  const arr: UnlockedRecord[] = Array.from(map.entries()).map(([id, unlockedAt]) => ({
    id,
    unlockedAt,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export function getBreathingCount(): number {
  try {
    return parseInt(localStorage.getItem(BREATHING_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function incrementBreathingCount(): number {
  const next = getBreathingCount() + 1;
  localStorage.setItem(BREATHING_KEY, String(next));
  return next;
}

function checkConditions(
  companion: CompanionState | null,
  streak: StreakData,
  journalEntries: MoodEntry[],
  breathingCount: number,
): Set<AchievementId> {
  const eligible = new Set<AchievementId>();
  if (!companion) return eligible;

  const { interactionCounts, stage } = companion;
  const totalActions =
    interactionCounts.nourish +
    interactionCounts.play +
    interactionCounts.rest +
    interactionCounts.comfort;

  if (totalActions >= 1) eligible.add('first_action');
  if (streak.count >= 7) eligible.add('streak_7');
  if (streak.count >= 30) eligible.add('streak_30');
  if (
    interactionCounts.nourish > 0 &&
    interactionCounts.play > 0 &&
    interactionCounts.rest > 0 &&
    interactionCounts.comfort > 0
  )
    eligible.add('all_actions');
  if (stage === 'sprout' || stage === 'bloom' || stage === 'flourish') eligible.add('evolution_1');
  if (stage === 'flourish') eligible.add('evolution_max');
  if (breathingCount >= 5) eligible.add('breathing_5');
  if (journalEntries.length >= 7) eligible.add('journal_7');

  return eligible;
}

interface UseAchievementsInput {
  companion: CompanionState | null;
  streak: StreakData;
  journalEntries: MoodEntry[];
  breathingCount: number;
}

interface UseAchievementsResult {
  achievements: AchievementStatus[];
  newlyUnlocked: AchievementId[];
  clearNewlyUnlocked: () => void;
}

export function useAchievements({
  companion,
  streak,
  journalEntries,
  breathingCount,
}: UseAchievementsInput): UseAchievementsResult {
  const [unlocked, setUnlocked] = useState<Map<AchievementId, string>>(loadUnlocked);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementId[]>([]);

  useEffect(() => {
    const eligible = checkConditions(companion, streak, journalEntries, breathingCount);
    const now = new Date().toISOString();
    const toUnlock: AchievementId[] = [];

    eligible.forEach((id) => {
      if (!unlocked.has(id)) toUnlock.push(id);
    });

    if (toUnlock.length === 0) return;

    setUnlocked((prev) => {
      const next = new Map(prev);
      toUnlock.forEach((id) => next.set(id, now));
      persistUnlocked(next);
      return next;
    });
    setNewlyUnlocked((prev) => [...prev, ...toUnlock]);
  }, [companion, streak, journalEntries, breathingCount, unlocked]);

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  const achievements: AchievementStatus[] = ALL_ACHIEVEMENT_IDS.map((id) => ({
    id,
    // eslint-disable-next-line security/detect-object-injection
    emoji: ACHIEVEMENT_EMOJIS[id],
    unlocked: unlocked.has(id),
    unlockedAt: unlocked.get(id),
  }));

  return { achievements, newlyUnlocked, clearNewlyUnlocked };
}
