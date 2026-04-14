import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompanionStore } from '@entities/companion';
import { useGameLoop } from '@features/game-loop';
import { useWellnessNudge } from '@features/game-loop';
import type { NudgeKey } from '@features/game-loop';
import { useToastStore } from '@shared/ui/Toast';
import { AppLayout } from '@widgets/AppLayout';
import { PetDisplay } from '@widgets/PetDisplay';
import { StatsPanel } from '@widgets/StatsPanel';
import { ActionBar } from '@widgets/ActionBar';

// Affirmations rotate every 60 seconds
const AFFIRMATION_ROTATE_MS = 60_000;

export function GamePage(): React.JSX.Element {
  const { t } = useTranslation(['common', 'wellness']);
  const navigate = useNavigate();

  const companion = useCompanionStore((s) => s.companion);
  const isLoading = useCompanionStore((s) => s.isLoading);
  const loadFromStorage = useCompanionStore((s) => s.loadFromStorage);
  const setNotificationHandler = useCompanionStore((s) => s.setNotificationHandler);

  const showToast = useToastStore((s) => s.showToast);

  // Load state on mount
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
      } else if (notification.type === 'actionSuccess') {
        // Subtle celebration for actions — not shown as toast (would be too frequent)
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

  return (
    <AppLayout>
      <div className="flex w-full max-w-sm flex-col gap-2 py-2">
        {/* Companion avatar + name + mood + speech bubble affirmation */}
        <PetDisplay speechBubble={currentAffirmation} />

        {/* Stats bars */}
        <StatsPanel />

        {/* Action buttons */}
        <ActionBar />
      </div>
    </AppLayout>
  );
}
