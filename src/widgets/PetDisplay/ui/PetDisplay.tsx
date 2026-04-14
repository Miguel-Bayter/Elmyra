import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanionStore } from '@entities/companion';
import { CompanionAvatar } from './CompanionAvatar';

// Mood → ambient ring color behind companion
const moodRingClass: Record<string, string> = {
  radiant: 'bg-lavender-mist',
  calm: 'bg-mint-mist',
  restless: 'bg-peach-mist',
  weary: 'bg-parchment-deep',
  fragile: 'bg-peach-mist',
  resting: 'bg-lavender-mist',
};

export function PetDisplay(): React.JSX.Element | null {
  const { t } = useTranslation('pet');

  const name = useCompanionStore((s) => s.companion?.name);
  const stage = useCompanionStore((s) => s.companion?.stage);
  const mood = useCompanionStore((s) => s.companion?.mood);
  const age = useCompanionStore((s) => s.companion?.age);
  const isResting = useCompanionStore((s) => s.companion?.isResting);

  if (!name || !stage || !mood || age === undefined) return null;

  // Safe: mood values come from a typed enum
  // eslint-disable-next-line security/detect-object-injection
  const ringClass = moodRingClass[mood] ?? 'bg-lavender-mist';

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Companion with ambient ring */}
      <div className="relative">
        {/* Ambient glow ring */}
        <div
          className={`absolute inset-0 -m-4 rounded-full ${ringClass} blur-xl opacity-70`}
          aria-hidden="true"
        />

        {/* Avatar */}
        <div
          className="animate-float relative h-40 w-40"
          aria-label={`${name}, ${t(`moods.${mood}`)}`}
        >
          <CompanionAvatar stage={stage} mood={mood} />
        </div>
      </div>

      {/* Name — primary label */}
      <h2 className="text-2xl font-bold tracking-tight text-ink">{name}</h2>

      {/* Stage + mood chips */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-lavender-light px-3 py-1 text-xs font-medium text-lavender-dark">
          {t(`stages.${stage}`)}
        </span>
        <span className="rounded-full bg-parchment-deep px-3 py-1 text-xs font-medium text-ink-secondary">
          {t(`moods.${mood}`)}
        </span>
      </div>

      {/* Age — quiet metadata */}
      <p className="text-xs text-ink-faint">
        {t('ageLabel')}: {t('ageTicks', { count: age })}
      </p>

      {/* Resting indicator */}
      {isResting && (
        <p className="rounded-full bg-mint-mist px-4 py-1.5 text-xs font-medium text-sage-dark">
          {t('isResting')}
        </p>
      )}
    </div>
  );
}
