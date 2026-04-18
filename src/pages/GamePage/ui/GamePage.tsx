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
import { AppLayout } from '@widgets/AppLayout';
import { PetDisplay } from '@widgets/PetDisplay';
import { StatsPanel } from '@widgets/StatsPanel';
import { ActionBar } from '@widgets/ActionBar';
import { EvolutionPanel } from '@widgets/EvolutionPanel';

// Affirmations rotate every 60 seconds
const AFFIRMATION_ROTATE_MS = 60_000;

// Which action each onboarding step highlights
const ONBOARDING_ACTION: Record<0 | 1 | 2, ActionType> = {
  0: 'nourish',
  1: 'play',
  2: 'rest',
};

export function GamePage(): React.JSX.Element {
  const { t } = useTranslation(['common', 'wellness', 'notifications']);
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

  // Reaction state — increments key so AnimatePresence re-fires on repeat taps
  const reactionKeyRef = useRef(0);
  const [lastReaction, setLastReaction] = useState<{ action: ActionType; key: number } | null>(
    null,
  );

  const handleAction = useCallback(
    (action: ActionType) => {
      reactionKeyRef.current += 1;
      setLastReaction({ action, key: reactionKeyRef.current });

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
      {/* Viewport-fit: fills exactly the space below the 52px navbar — no page scroll */}
      <div className="flex h-[calc(100dvh-52px)] w-full max-w-sm flex-col overflow-hidden">
        {/* ── Companion zone — fills all remaining space ── */}
        <div className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-hidden px-3 pt-2">
          <PetDisplay speechBubble={currentAffirmation} reaction={lastReaction} compact />
        </div>

        {/* ── Bottom dock — always visible, never scrolled past ── */}
        <div className="flex flex-shrink-0 flex-col gap-2 px-3 pb-4 pt-1">
          {/* Onboarding welcome message — step 0 only */}
          <AnimatePresence>
            {onboardingStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-xl border border-lavender/20 bg-lavender-mist px-3 py-2 text-center"
              >
                <p className="text-xs text-ink-secondary">
                  {t('onboarding.welcome', { ns: 'common', name: companion.name })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <EvolutionPanel />
          <StatsPanel />
          <ActionBar
            onAction={handleAction}
            highlightAction={activeHighlight}
            highlightLabel={onboardingHint}
          />
        </div>
      </div>
    </AppLayout>
  );
}
