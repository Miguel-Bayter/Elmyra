import React from 'react';
import { motion } from 'framer-motion';
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

const ACTION_EMOJI: Record<ActionType, string> = {
  nourish: '🍃',
  play: '✨',
  rest: '🌙',
  comfort: '💜',
};

interface EvolutionTheme {
  nodeFilled: string;
  connectorFilled: string;
  connectorEmpty: string;
  panelBg: string;
  panelBorder: string;
  accentText: string;
  hintText: string;
  progress: string;
}

const EVOLUTION_THEME: Record<CompanionSpecies, EvolutionTheme> = {
  zephyr: {
    nodeFilled: 'bg-soft-mint',
    connectorFilled: 'bg-soft-mint',
    connectorEmpty: 'bg-soft-mint/20',
    panelBg: 'bg-mint-mist',
    panelBorder: 'border border-soft-mint/25',
    accentText: 'text-sage-dark',
    hintText: 'text-ink-secondary',
    progress: 'progress-accent',
  },
  kova: {
    nodeFilled: 'bg-warm-peach',
    connectorFilled: 'bg-warm-peach',
    connectorEmpty: 'bg-warm-peach/20',
    panelBg: 'bg-peach-mist',
    panelBorder: 'border border-warm-peach/25',
    accentText: 'text-ink-secondary',
    hintText: 'text-ink-secondary',
    progress: 'progress-warning',
  },
  luma: {
    nodeFilled: 'bg-golden',
    connectorFilled: 'bg-golden',
    connectorEmpty: 'bg-golden/20',
    panelBg: 'bg-golden-mist',
    panelBorder: 'border border-golden/25',
    accentText: 'text-golden-dark',
    hintText: 'text-ink-secondary',
    progress: 'progress-warning',
  },
  maru: {
    nodeFilled: 'bg-lavender',
    connectorFilled: 'bg-lavender',
    connectorEmpty: 'bg-lavender/20',
    panelBg: 'bg-lavender-mist',
    panelBorder: 'border border-lavender/25',
    accentText: 'text-lavender-dark',
    hintText: 'text-ink-secondary',
    progress: 'progress-primary',
  },
  // 2D kawaii species
  nimbus: {
    nodeFilled: 'bg-lavender',
    connectorFilled: 'bg-lavender',
    connectorEmpty: 'bg-lavender/20',
    panelBg: 'bg-lavender-mist',
    panelBorder: 'border border-lavender/20',
    accentText: 'text-lavender-dark',
    hintText: 'text-ink-secondary',
    progress: 'progress-primary',
  },
  boba: {
    nodeFilled: 'bg-soft-mint',
    connectorFilled: 'bg-soft-mint',
    connectorEmpty: 'bg-soft-mint/20',
    panelBg: 'bg-mint-mist',
    panelBorder: 'border border-soft-mint/20',
    accentText: 'text-sage-dark',
    hintText: 'text-ink-secondary',
    progress: 'progress-accent',
  },
  mochi: {
    nodeFilled: 'bg-warm-peach',
    connectorFilled: 'bg-warm-peach',
    connectorEmpty: 'bg-warm-peach/20',
    panelBg: 'bg-peach-mist',
    panelBorder: 'border border-warm-peach/20',
    accentText: 'text-ink-secondary',
    hintText: 'text-ink-secondary',
    progress: 'progress-warning',
  },
  nuri: {
    nodeFilled: 'bg-sage',
    connectorFilled: 'bg-sage',
    connectorEmpty: 'bg-sage/20',
    panelBg: 'bg-sage-mist',
    panelBorder: 'border border-sage/20',
    accentText: 'text-sage-dark',
    hintText: 'text-ink-secondary',
    progress: 'progress-success',
  },
};

interface EvolutionResult {
  nextStage: CompanionStage | null;
  boostsToNext: number;
  signatureAction: ActionType | null;
  progressPct: number;
}

function computeEvolutionProgress(
  age: number,
  counts: InteractionCounts,
  species: CompanionSpecies,
  currentStage: CompanionStage,
): EvolutionResult {
  // eslint-disable-next-line security/detect-object-injection
  const signatureAction = SPECIES_PRIMARY_ACTION[species] ?? null;
  // eslint-disable-next-line security/detect-object-injection
  const boostCount = signatureAction ? (counts[signatureAction] ?? 0) : 0;
  const effectiveAge = age + boostCount * INTERACTION_BOOST_WEIGHT;
  // eslint-disable-next-line security/detect-object-injection
  const currentIdx = STAGE_INDEX[currentStage];

  if (currentIdx >= 3)
    return { nextStage: null, boostsToNext: 0, signatureAction, progressPct: 100 };

  const nextStage = STAGES[currentIdx + 1] ?? null;
  if (!nextStage) return { nextStage: null, boostsToNext: 0, signatureAction, progressPct: 100 };

  // eslint-disable-next-line security/detect-object-injection
  const currentThreshold = STAGE_THRESHOLDS[currentStage];
  // eslint-disable-next-line security/detect-object-injection
  const nextThreshold = STAGE_THRESHOLDS[nextStage];
  const span = nextThreshold - currentThreshold;
  const done = effectiveAge - currentThreshold;
  const progressPct = span > 0 ? Math.min(100, Math.max(0, Math.round((done / span) * 100))) : 0;
  const remainingEffective = Math.max(0, nextThreshold - effectiveAge);
  const boostsToNext = signatureAction
    ? Math.ceil(remainingEffective / INTERACTION_BOOST_WEIGHT)
    : 0;

  return { nextStage, boostsToNext, signatureAction, progressPct };
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

  // eslint-disable-next-line security/detect-object-injection
  const theme = EVOLUTION_THEME[species];
  // eslint-disable-next-line security/detect-object-injection
  const currentIdx = STAGE_INDEX[stage];

  const { nextStage, boostsToNext, signatureAction, progressPct } = computeEvolutionProgress(
    age,
    interactionCounts,
    species,
    stage,
  );

  let hint: string;
  if (!nextStage) {
    hint = t('evolutionPanel.complete', { name });
  } else if (signatureAction && boostsToNext > 0 && boostsToNext <= 25) {
    // eslint-disable-next-line security/detect-object-injection
    const actionEmoji = ACTION_EMOJI[signatureAction];
    const actionLabel = t(`evolutionPanel.actionGerund.${signatureAction}`);
    const nextStageName = t(`species.${species}.stages.${nextStage}`);
    hint = t('evolutionPanel.hintClose', {
      count: boostsToNext,
      action: `${actionEmoji} ${actionLabel}`,
      stage: nextStageName,
    });
  } else if (signatureAction) {
    // eslint-disable-next-line security/detect-object-injection
    const actionEmoji = ACTION_EMOJI[signatureAction];
    const actionLabel = t(`evolutionPanel.actionGerund.${signatureAction}`);
    hint = t('evolutionPanel.hintFar', { action: `${actionEmoji} ${actionLabel}`, name });
  } else {
    hint = t('evolutionPanel.hintNoSignature', { name });
  }

  return (
    <div
      className={clsx('w-full rounded-xl px-3 py-2.5', theme.panelBg, theme.panelBorder)}
      role="region"
      aria-label={t('evolutionPanel.title')}
    >
      {/* ── Row 1: title + hint on same line ── */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className={clsx(
            'shrink-0 text-[9px] font-bold uppercase tracking-widest',
            theme.accentText,
          )}
        >
          {t('evolutionPanel.title')}
        </span>
        <span className={clsx('flex-1 truncate text-[10px] leading-none', theme.hintText)}>
          {hint}
        </span>
        {nextStage && (
          <span className={clsx('shrink-0 text-[9px] font-bold tabular-nums', theme.accentText)}>
            {progressPct}%
          </span>
        )}
      </div>

      {/* ── Progress bar ── */}
      {nextStage && (
        <progress
          className={clsx('progress mb-2 h-1 w-full', theme.progress)}
          value={progressPct}
          max={100}
          aria-label={`${progressPct}% hacia ${t(`species.${species}.stages.${nextStage}`)}`}
        />
      )}

      {/* ── Stage nodes + connectors ── */}
      <div className="flex w-full items-start" role="list">
        {STAGES.map((stageKey, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;

          return (
            <React.Fragment key={stageKey}>
              <div role="listitem" className="flex flex-col items-center gap-1">
                {isCurrent ? (
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className={clsx('h-3 w-3 rounded-full shadow-sm', theme.nodeFilled)}
                    aria-hidden="true"
                  />
                ) : isPast ? (
                  <div
                    className={clsx(
                      'flex h-3 w-3 items-center justify-center rounded-full',
                      theme.nodeFilled,
                    )}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 8 8" fill="none" className="h-2 w-2">
                      <path
                        d="M1.5 4L3.5 6L6.5 2"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      'h-3 w-3 rounded-full border-2 border-current',
                      theme.connectorEmpty,
                    )}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={clsx(
                    'w-[44px] text-center text-[9px] leading-tight',
                    isCurrent && `font-bold ${theme.accentText}`,
                    isPast && 'font-medium text-ink-muted',
                    isFuture && 'text-ink-muted opacity-50',
                  )}
                >
                  {t(`species.${species}.stages.${stageKey}`)}
                </span>
              </div>

              {idx < 3 && (
                <div className="mb-[3px] mt-[5px] flex-1 self-start">
                  <div
                    className={clsx(
                      'h-0.5 w-full rounded-full',
                      idx < currentIdx ? theme.connectorFilled : theme.connectorEmpty,
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
