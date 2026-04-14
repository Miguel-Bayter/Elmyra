import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompanionStore } from '@entities/companion';
import { AppLayout } from '@widgets/AppLayout';
import { CompanionAvatar } from '@widgets/PetDisplay';
import { Button } from '@shared/ui/Button';

export function RestModePage(): React.JSX.Element {
  const { t } = useTranslation('pet');
  const navigate = useNavigate();

  const companion = useCompanionStore((s) => s.companion);
  const milestone = useCompanionStore((s) => s.milestone);
  const wakeFromRestMode = useCompanionStore((s) => s.wakeFromRestMode);

  // If no companion → back to welcome; if not in rest mode → back to game
  useEffect(() => {
    if (!companion) {
      void navigate('/');
    } else if (!companion.isInRestMode) {
      void navigate('/companion');
    }
  }, [companion, navigate]);

  const handleWakeUp = (): void => {
    wakeFromRestMode();
    void navigate('/companion');
  };

  if (!companion) return <></>;

  return (
    <AppLayout>
      <div className="flex w-full max-w-sm flex-col items-center gap-6 py-10 text-center">
        {/* Companion sleeping peacefully */}
        <div className="h-40 w-40 opacity-70">
          <CompanionAvatar species={companion.species} stage={companion.stage} mood="resting" />
        </div>

        {/* Gentle title — no failure language (R7) */}
        <div className="space-y-2">
          <h1 className="text-calm-text text-2xl font-semibold">{t('restMode.title')}</h1>
          <p className="text-calm-text-muted leading-relaxed">{t('restMode.body')}</p>
        </div>

        {/* Milestone — framed as achievement, not failure */}
        <div className="bg-lavender/10 w-full rounded-xl px-4 py-3 text-sm">
          <p className="text-calm-text">
            {t('restMode.milestoneReached', { stage: t(`stages.${companion.stage}`) })}
          </p>
          {milestone && (
            <p className="text-calm-text-muted mt-1 text-xs">
              {t('restMode.longestStreak', { count: milestone.longestStreak })}
            </p>
          )}
        </div>

        {/* Single gentle CTA */}
        <Button onClick={handleWakeUp} label={t('restMode.wakeUp')} variant="calm" size="lg" />
      </div>
    </AppLayout>
  );
}
