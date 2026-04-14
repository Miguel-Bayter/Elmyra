import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanionStore } from '@entities/companion';
import { ProgressBar, getStatColorClass } from '@shared/ui/ProgressBar';

export function StatsPanel(): React.JSX.Element | null {
  const { t } = useTranslation('pet');

  const nourishment = useCompanionStore((s) => s.companion?.nourishment ?? 0);
  const joy = useCompanionStore((s) => s.companion?.joy ?? 0);
  const energy = useCompanionStore((s) => s.companion?.energy ?? 0);
  const vitality = useCompanionStore((s) => s.companion?.vitality ?? 0);
  const hasCompanion = useCompanionStore((s) => s.companion !== null);

  if (!hasCompanion) return null;

  return (
    <div className="border-card w-full rounded-3xl bg-parchment px-5 py-4 shadow-sm shadow-ink/5">
      <div className="space-y-3.5">
        <ProgressBar
          value={nourishment}
          label={t('stats.nourishment')}
          colorClass={getStatColorClass(nourishment)}
          showValue
        />
        <ProgressBar
          value={joy}
          label={t('stats.joy')}
          colorClass={getStatColorClass(joy)}
          showValue
        />
        <ProgressBar
          value={energy}
          label={t('stats.energy')}
          colorClass={getStatColorClass(energy)}
          showValue
        />
        <ProgressBar
          value={vitality}
          label={t('stats.vitality')}
          colorClass={getStatColorClass(vitality)}
          showValue
        />
      </div>
    </div>
  );
}
