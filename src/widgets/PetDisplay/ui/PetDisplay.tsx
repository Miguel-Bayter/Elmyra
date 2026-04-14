import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { useCompanionStore } from '@entities/companion';
import type { CompanionMood, CompanionSpecies, CompanionStage } from '@entities/companion';
import { CompanionAvatar } from './CompanionAvatar';

// ─── Mood → ambient glow ring ─────────────────────────────────────────────────
const MOOD_RING: Record<CompanionMood, string> = {
  radiant: 'bg-lavender-mist',
  calm: 'bg-mint-mist',
  restless: 'bg-peach-mist',
  weary: 'bg-parchment-deep',
  fragile: 'bg-peach-mist',
  resting: 'bg-lavender-mist',
};

// ─── Mood → small dot color on the mood chip (semantic, R7 — no red) ─────────
const MOOD_DOT: Record<CompanionMood, string> = {
  radiant: 'bg-lavender',
  calm: 'bg-sage',
  restless: 'bg-warm-peach',
  weary: 'bg-ink-faint',
  fragile: 'bg-warm-peach',
  resting: 'bg-soft-mint',
};

// ─── Evolution stage level (Roman numerals — universal, not translated) ───────
const STAGE_LEVEL: Record<CompanionStage, string> = {
  seedling: 'I',
  sprout: 'II',
  bloom: 'III',
  flourish: 'IV',
};

// ─── Species → stage chip colors (reflects each species' identity) ────────────
interface ChipTheme {
  bg: string;
  text: string;
  level: string;
}

const SPECIES_CHIP: Record<CompanionSpecies, ChipTheme> = {
  felis: { bg: 'bg-lavender-light', text: 'text-lavender-dark', level: 'text-lavender' },
  spectra: { bg: 'bg-mint-mist', text: 'text-sage-dark', level: 'text-sage' },
  dolcis: { bg: 'bg-peach-mist', text: 'text-warm-peach', level: 'text-warm-peach' },
};

export function PetDisplay(): React.JSX.Element | null {
  const { t } = useTranslation('pet');

  const name = useCompanionStore((s) => s.companion?.name);
  const species = useCompanionStore((s) => s.companion?.species);
  const stage = useCompanionStore((s) => s.companion?.stage);
  const mood = useCompanionStore((s) => s.companion?.mood);
  const age = useCompanionStore((s) => s.companion?.age);
  const isResting = useCompanionStore((s) => s.companion?.isResting);

  if (!name || !species || !stage || !mood || age === undefined) return null;

  // Safe: mood, species, stage are typed union values, never user-supplied strings
  // eslint-disable-next-line security/detect-object-injection
  const ringClass = MOOD_RING[mood] ?? 'bg-lavender-mist';
  // eslint-disable-next-line security/detect-object-injection
  const dotClass = MOOD_DOT[mood] ?? 'bg-ink-faint';
  // eslint-disable-next-line security/detect-object-injection
  const chipTheme = SPECIES_CHIP[species];
  // eslint-disable-next-line security/detect-object-injection
  const levelLabel = STAGE_LEVEL[stage];

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Companion with ambient glow ring */}
      <div className="relative">
        <div
          className={`absolute inset-0 -m-4 rounded-full ${ringClass} blur-xl opacity-70`}
          aria-hidden="true"
        />
        <div
          className="animate-float relative h-40 w-40"
          aria-label={`${name}, ${t(`moods.${mood}`)}`}
        >
          <CompanionAvatar species={species} stage={stage} mood={mood} />
        </div>
      </div>

      {/* Name */}
      <h2 className="text-2xl font-bold tracking-tight text-ink">{name}</h2>

      {/* Evolution stage + mood chips */}
      <div className="flex items-center gap-2">
        {/* Stage chip — species color + Roman numeral evolution level */}
        <span
          className={clsx(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            chipTheme.bg,
            chipTheme.text,
          )}
          aria-label={`${t('stageLevelLabel')} ${levelLabel}: ${t(`species.${species}.stages.${stage}`, { ns: 'common' })}`}
        >
          <span className={clsx('font-bold', chipTheme.level)} aria-hidden="true">
            {levelLabel}
          </span>
          <span aria-hidden="true">·</span>
          {}
          <span>{t(`species.${species}.stages.${stage}`, { ns: 'common' })}</span>
        </span>

        {/* Mood chip — semantic dot + name */}
        <span
          className="flex items-center gap-1.5 rounded-full bg-parchment-deep px-3 py-1 text-xs font-medium text-ink-secondary"
          aria-label={`${t('moodLabel')}: ${t(`moods.${mood}`)}`}
        >
          <span
            className={clsx('h-1.5 w-1.5 rounded-full flex-shrink-0', dotClass)}
            aria-hidden="true"
          />
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
