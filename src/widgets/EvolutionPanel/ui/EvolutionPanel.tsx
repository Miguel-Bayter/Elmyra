import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import {
  useCompanionStore,
  STAGE_THRESHOLDS,
  INTERACTION_BOOST_WEIGHT,
  SPECIES_PRIMARY_ACTION,
} from '@entities/companion';
import type {
  CompanionSpecies,
  CompanionStage,
  InteractionCounts,
  ActionType,
} from '@entities/companion';

const STAGES: CompanionStage[] = ['seedling', 'sprout', 'bloom', 'flourish'];
const STAGE_INDEX: Record<CompanionStage, number> = {
  seedling: 0,
  sprout: 1,
  bloom: 2,
  flourish: 3,
};

const SPECIES_PROGRESS_CLASS: Record<CompanionSpecies, string> = {
  zephyr: 'progress-accent',
  kova: 'progress-warning',
  luma: 'progress-warning',
  maru: 'progress-primary',
  nimbus: 'progress-primary',
  boba: 'progress-accent',
  mochi: 'progress-warning',
  nuri: 'progress-success',
};

const SPECIES_LABEL_CLASS: Record<CompanionSpecies, string> = {
  zephyr: 'text-sage-dark',
  kova: 'text-ink-secondary',
  luma: 'text-golden-dark',
  maru: 'text-lavender-dark',
  nimbus: 'text-lavender-dark',
  boba: 'text-sage-dark',
  mochi: 'text-ink-secondary',
  nuri: 'text-sage-dark',
};

function computeProgress(
  age: number,
  counts: InteractionCounts,
  species: CompanionSpecies,
  stage: CompanionStage,
): { progressPct: number; nextStage: CompanionStage | null; signatureAction: ActionType | null } {
  // eslint-disable-next-line security/detect-object-injection
  const signatureAction = SPECIES_PRIMARY_ACTION[species] ?? null;
  // eslint-disable-next-line security/detect-object-injection
  const boostCount = signatureAction ? (counts[signatureAction] ?? 0) : 0;
  const effectiveAge = age + boostCount * INTERACTION_BOOST_WEIGHT;
  // eslint-disable-next-line security/detect-object-injection
  const currentIdx = STAGE_INDEX[stage];

  if (currentIdx >= 3) return { progressPct: 100, nextStage: null, signatureAction };

  const nextStage = STAGES[currentIdx + 1] ?? null;
  if (!nextStage) return { progressPct: 100, nextStage: null, signatureAction };

  // eslint-disable-next-line security/detect-object-injection
  const currentThreshold = STAGE_THRESHOLDS[stage];
  // eslint-disable-next-line security/detect-object-injection
  const nextThreshold = STAGE_THRESHOLDS[nextStage];
  const span = nextThreshold - currentThreshold;
  const done = effectiveAge - currentThreshold;
  const progressPct = span > 0 ? Math.min(100, Math.max(0, Math.round((done / span) * 100))) : 0;

  return { progressPct, nextStage, signatureAction };
}

export function EvolutionPanel(): React.JSX.Element | null {
  const { t } = useTranslation('common');

  const hasCompanion = useCompanionStore((s) => s.companion !== null);
  const name = useCompanionStore((s) => s.companion?.name ?? '');
  const species = useCompanionStore((s) => s.companion?.species ?? 'zephyr');
  const stage = useCompanionStore((s) => s.companion?.stage ?? 'seedling');
  const age = useCompanionStore((s) => s.companion?.age ?? 0);
  const interactionCounts = useCompanionStore(
    (s) => s.companion?.interactionCounts ?? { nourish: 0, play: 0, rest: 0, comfort: 0 },
  );

  if (!hasCompanion) return null;

  const { progressPct, nextStage, signatureAction } = computeProgress(
    age,
    interactionCounts,
    species,
    stage,
  );

  // eslint-disable-next-line security/detect-object-injection
  const progressClass = SPECIES_PROGRESS_CLASS[species];
  // eslint-disable-next-line security/detect-object-injection
  const labelClass = SPECIES_LABEL_CLASS[species];

  const currentStageName = t(`species.${species}.stages.${stage}`);
  const nextStageName = nextStage ? t(`species.${species}.stages.${nextStage}`) : null;

  const actionGerund = signatureAction ? t(`evolutionPanel.actionGerund.${signatureAction}`) : null;

  const tooltipText = nextStage
    ? signatureAction && actionGerund
      ? t('evolutionPanel.tipSignature', { name, action: actionGerund })
      : t('evolutionPanel.tipNoSignature', { name })
    : t('evolutionPanel.tipComplete', { name });

  return (
    <div
      className="flex w-full flex-col gap-0.5"
      role="region"
      aria-label={t('evolutionPanel.title')}
    >
      {/* Stage label row */}
      <div className="flex min-w-0 items-center gap-1">
        <span className={clsx('min-w-0 shrink truncate text-micro font-medium', labelClass)}>
          {currentStageName}
        </span>
        {nextStageName && (
          <>
            <span className="shrink-0 text-micro text-ink-faint" aria-hidden="true">
              →
            </span>
            <span className="min-w-0 shrink truncate text-micro text-ink-muted">
              {nextStageName}
            </span>
            <span className="shrink-0 tabular-nums text-micro font-normal text-ink-muted">
              {progressPct}%
            </span>
          </>
        )}
        {!nextStage && <span className="shrink-0 text-micro text-golden-dark">✨</span>}

        {/* Spacer */}
        <span className="flex-1" />

        {/* ? tooltip badge */}
        <div className="tooltip tooltip-left" data-tip={tooltipText}>
          <button
            type="button"
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-base-300 text-micro leading-none text-base-content/40 hover:bg-base-content/10 hover:text-base-content/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label={t('evolutionPanel.title')}
          >
            ?
          </button>
        </div>
      </div>

      <progress
        className={clsx('progress h-1 w-full', progressClass)}
        value={progressPct}
        max={100}
        aria-label={`${progressPct}% ${nextStageName ?? ''}`}
      />
    </div>
  );
}
