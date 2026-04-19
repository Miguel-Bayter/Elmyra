import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useCompanionStore } from '@entities/companion';
import type { ActionType } from '@entities/companion';
import { useGameLoop } from '@features/game-loop';
import { useWellnessNudge } from '@features/game-loop';
import type { NudgeKey } from '@features/game-loop';
import { useToastStore } from '@shared/ui/Toast';
import { Modal } from '@shared/ui/Modal';
import { BreathingModal, BreathingButton } from '@features/rest-pet';
import { useJournal, MoodCheckIn } from '@features/mood-journal';
import {
  useAchievements,
  incrementBreathingCount,
  getBreathingCount,
} from '@features/achievements';
import { AppLayout } from '@widgets/AppLayout';
import { PetDisplay } from '@widgets/PetDisplay';
import { StatsPanel } from '@widgets/StatsPanel';
import { ActionBar } from '@widgets/ActionBar';
import { EvolutionPanel } from '@widgets/EvolutionPanel';

// Affirmations rotate every 60 seconds
const AFFIRMATION_ROTATE_MS = 60_000;

// Inactivity threshold before showing session summary
const SESSION_IDLE_MS = 20 * 60 * 1000;

const SESSION_ACTIONS: { action: ActionType; emoji: string }[] = [
  { action: 'nourish', emoji: '🍃' },
  { action: 'play', emoji: '✨' },
  { action: 'rest', emoji: '🌙' },
  { action: 'comfort', emoji: '💜' },
];

// Which action each onboarding step highlights
const ONBOARDING_ACTION: Record<0 | 1 | 2, ActionType> = {
  0: 'nourish',
  1: 'play',
  2: 'rest',
};

export function GamePage(): React.JSX.Element {
  const { t } = useTranslation(['common', 'wellness', 'notifications']);
  const { t: tJournal } = useTranslation('journal');
  const navigate = useNavigate();

  const companion = useCompanionStore((s) => s.companion);
  const isLoading = useCompanionStore((s) => s.isLoading);
  const loadFromStorage = useCompanionStore((s) => s.loadFromStorage);
  const setNotificationHandler = useCompanionStore((s) => s.setNotificationHandler);
  const onboardingStep = useCompanionStore((s) => s.preferences.onboardingStep);
  const advanceOnboarding = useCompanionStore((s) => s.advanceOnboarding);

  const showToast = useToastStore((s) => s.showToast);

  // Load state on mount (StoreInitializer in AppProviders also calls this — idempotent)
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Wire up store notification handler → toasts
  useEffect(() => {
    setNotificationHandler((notification) => {
      if (notification.type === 'restModeEntered') {
        showToast(t('restModeEntered', { name: notification.name, ns: 'notifications' }), 'info');
      } else if (notification.type === 'longAbsence') {
        showToast(t('longAbsence', { name: notification.name, ns: 'notifications' }), 'nudge');
      } else if (notification.type === 'streakMilestone') {
        showToast(
          t('streakMilestone', { count: notification.count, ns: 'notifications' }),
          'celebration',
        );
      }
    });
  }, [setNotificationHandler, showToast, t]);

  // Redirect: no companion → welcome, rest mode → rest page
  useEffect(() => {
    if (!isLoading && !companion) {
      void navigate('/');
    } else if (companion?.isInRestMode) {
      void navigate('/resting');
    }
  }, [isLoading, companion, navigate]);

  // Mount game loop — pauses automatically when companion is resting/in rest mode
  useGameLoop();

  // Wellness nudges → toasts
  const handleNudge = useCallback(
    (key: NudgeKey) => {
      showToast(t(`nudges.${key}`, { ns: 'wellness' }), 'nudge');
    },
    [showToast, t],
  );
  useWellnessNudge(handleNudge);

  // Rotating affirmation
  const affirmations = t('affirmations', { ns: 'wellness', returnObjects: true }) as string[];
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setAffirmationIdx((prev) => (prev + 1) % affirmations.length);
    }, AFFIRMATION_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [affirmations.length]);

  // Mood journal state
  const { entries: journalEntries, addEntry, hasTodayEntry } = useJournal();
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Breathing state — count tracked in localStorage for achievements
  const [breathingCount, setBreathingCount] = useState(getBreathingCount);
  const [showBreathing, setShowBreathing] = useState(false);
  const performAction = useCompanionStore((s) => s.performAction);

  // Achievements — check on every relevant state change, fire toasts for new unlocks
  const streak = useCompanionStore((s) => s.streak);
  const { t: tAchievements } = useTranslation('achievements');
  const { newlyUnlocked, clearNewlyUnlocked } = useAchievements({
    companion,
    streak,
    journalEntries,
    breathingCount,
  });
  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    newlyUnlocked.forEach((id) => {
      showToast(
        tAchievements('unlocked', { name: tAchievements(`badges.${id}.name` as never) }),
        'celebration',
      );
    });
    clearNewlyUnlocked();
  }, [newlyUnlocked, clearNewlyUnlocked, showToast, tAchievements]);

  const handleBreathingComplete = useCallback(() => {
    performAction('rest');
    setBreathingCount(incrementBreathingCount());
    showToast(t('breathing.done', { ns: 'actions' }), 'celebration');
  }, [performAction, showToast, t]);

  // Session summary state
  const inactivityTimerRef = useRef<number | null>(null);
  const [actionsThisSession, setActionsThisSession] = useState<Partial<Record<ActionType, number>>>(
    {},
  );
  const [showSummary, setShowSummary] = useState(false);

  // Start inactivity timer on mount; show summary after SESSION_IDLE_MS with no action
  useEffect(() => {
    inactivityTimerRef.current = window.setTimeout(() => setShowSummary(true), SESSION_IDLE_MS);
    return () => {
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  // Reaction state — increments key so AnimatePresence re-fires on repeat taps
  const reactionKeyRef = useRef(0);
  const [lastReaction, setLastReaction] = useState<{ action: ActionType; key: number } | null>(
    null,
  );

  const handleAction = useCallback(
    (action: ActionType) => {
      reactionKeyRef.current += 1;
      setLastReaction({ action, key: reactionKeyRef.current });

      // Track for session summary
      // eslint-disable-next-line security/detect-object-injection
      setActionsThisSession((prev) => ({ ...prev, [action]: (prev[action] ?? 0) + 1 }));

      // Reset inactivity timer
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(() => setShowSummary(true), SESSION_IDLE_MS);

      // Advance onboarding if user just performed the highlighted action
      // eslint-disable-next-line security/detect-object-injection
      if (onboardingStep !== 'done' && ONBOARDING_ACTION[onboardingStep] === action) {
        advanceOnboarding();
      }
    },
    [onboardingStep, advanceOnboarding],
  );

  if (isLoading || !companion) {
    return (
      <AppLayout>
        <div className="flex flex-1 items-center justify-center">
          <span
            className="loading loading-dots loading-md text-primary"
            aria-label={t('loading', { ns: 'common' })}
          />
        </div>
      </AppLayout>
    );
  }

  // Safe: affirmationIdx is derived from modulo of affirmations.length — always in bounds
  // eslint-disable-next-line security/detect-object-injection
  const currentAffirmation = affirmations[affirmationIdx] ?? affirmations[0] ?? '';

  // eslint-disable-next-line security/detect-object-injection
  const activeHighlight = onboardingStep !== 'done' ? ONBOARDING_ACTION[onboardingStep] : null;
  const onboardingHint = activeHighlight
    ? t(`onboarding.step${onboardingStep as 0 | 1 | 2}`, { ns: 'common' })
    : undefined;

  return (
    <AppLayout>
      {/* Full viewport below navbar — card layout on sm+ */}
      <div className="flex h-[calc(100dvh-52px)] w-full max-w-sm flex-col overflow-hidden sm:my-4 sm:h-auto sm:max-h-[720px] sm:rounded-3xl sm:shadow-2xl sm:shadow-base-content/10">
        {/* ── Companion hero zone ── */}
        <div className="bg-game-gradient flex flex-1 min-h-[200px] flex-col items-center justify-center overflow-hidden px-3 pt-2 pb-1 sm:px-6 sm:rounded-t-3xl">
          <PetDisplay speechBubble={currentAffirmation} reaction={lastReaction} compact />
        </div>

        {/* ── Care panel — elevated card rising from bottom ── */}
        <div className="flex flex-shrink-0 flex-col gap-2 rounded-t-3xl border-t border-base-300 bg-base-100 px-3 pb-4 pt-3 shadow-care sm:px-5 sm:pb-5 sm:rounded-b-3xl sm:border-t-0 sm:shadow-none sm:border-x sm:border-b">
          {/* Onboarding nudge — step 0 only */}
          <AnimatePresence>
            {onboardingStep === 0 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-center text-tiny italic text-ink-muted"
              >
                {t('onboarding.welcome', { ns: 'common', name: companion.name })}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Evolution + Stats — single info strip */}
          <div className="flex flex-col gap-2">
            <EvolutionPanel />
            <StatsPanel />
          </div>

          {/* Care actions — 2×2 grid */}
          <ActionBar
            onAction={handleAction}
            highlightAction={activeHighlight}
            highlightLabel={onboardingHint}
          />

          {/* Wellness row — breathing + mood check-in + achievements */}
          <div className="flex gap-1.5">
            <div className="flex-1">
              <BreathingButton onClick={() => setShowBreathing(true)} />
            </div>
            <button
              type="button"
              onClick={() => (hasTodayEntry ? void navigate('/journal') : setShowCheckIn(true))}
              className="btn btn-sm rounded-xl border border-base-300 bg-base-200 text-base-content/60 hover:bg-base-300 flex flex-col items-center gap-0.5 h-auto py-2 px-3"
              aria-label={t('journalBtn', { ns: 'common' })}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {hasTodayEntry ? '📖' : '✏️'}
              </span>
              <span className="text-nano font-normal">
                {t(hasTodayEntry ? 'journalView' : 'journalCheckIn', { ns: 'common' })}
              </span>
            </button>
            <button
              type="button"
              onClick={() => void navigate('/achievements')}
              className="btn btn-sm rounded-xl border border-base-300 bg-base-200 text-base-content/60 hover:bg-base-300 flex flex-col items-center gap-0.5 h-auto py-2 px-3"
              aria-label={t('achievementsBtn', { ns: 'common' })}
            >
              <span className="text-base leading-none" aria-hidden="true">
                🏅
              </span>
              <span className="text-nano font-normal">
                {t('achievementsBtn', { ns: 'common' })}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mood check-in modal ── */}
      <MoodCheckIn
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSave={(entry) => {
          addEntry(entry);
          showToast(tJournal('saved'), 'celebration');
        }}
        companionMood={companion.mood}
        hasTodayEntry={hasTodayEntry}
      />

      {/* ── Breathing mini-game modal ── */}
      <BreathingModal
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
        onComplete={handleBreathingComplete}
      />

      {/* ── Session summary modal — shown after 20 min inactivity ── */}
      <Modal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        title={t('sessionSummary.title')}
        closeLabel={t('sessionSummary.close')}
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs text-ink-muted">{t('sessionSummary.subtitle')}</p>

          {Object.values(actionsThisSession).every((c) => !c) ? (
            <p className="text-sm italic text-ink-secondary">
              {t('sessionSummary.noActions', { name: companion.name })}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {SESSION_ACTIONS.map(({ action, emoji }) => {
                // eslint-disable-next-line security/detect-object-injection
                const count = actionsThisSession[action] ?? 0;
                if (count === 0) return null;
                return (
                  <div key={action} className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">
                      {emoji}
                    </span>
                    <span className="text-sm text-ink">{t(action, { ns: 'actions' })}</span>
                    <span className="ml-auto text-sm font-bold tabular-nums text-ink-secondary">
                      {count}×
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-1 border-t border-border-medium pt-2 text-xs text-ink-muted">
            {t('sessionSummary.moodLabel', { name: companion.name })}{' '}
            <span className="font-semibold text-ink-secondary">
              {t(`moods.${companion.mood}`, { ns: 'pet' })}
            </span>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
