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
  nodeGlow: string;
  connectorFilled: string;
  panelBg: string;
  accentText: string;
  hintText: string;
}

const EVOLUTION_THEME: Record<CompanionSpecies, EvolutionTheme> = {
  zephyr: {
    nodeFilled: 'bg-soft-mint',
    nodeGlow: 'ring-soft-mint',
    connectorFilled: 'bg-soft-mint',
    panelBg: 'bg-mint-mist',
    accentText: 'text-sage-dark',
    hintText: 'text-sage',
  },
  kova: {
    nodeFilled: 'bg-warm-peach',
    nodeGlow: 'ring-warm-peach',
    connectorFilled: 'bg-warm-peach',
    panelBg: 'bg-parchment-deep',
    accentText: 'text-ink-secondary',
    hintText: 'text-ink-muted',
  },
  luma: {
    nodeFilled: 'bg-golden',
    nodeGlow: 'ring-golden',
    connectorFilled: 'bg-golden',
    panelBg: 'bg-golden-mist',
    accentText: 'text-golden-dark',
    hintText: 'text-golden-dark',
  },
  maru: {
    nodeFilled: 'bg-lavender',
    nodeGlow: 'ring-lavender',
    connectorFilled: 'bg-lavender',
    panelBg: 'bg-lavender-mist',
    accentText: 'text-lavender-dark',
    hintText: 'text-lavender-dark',
  },
};

function computeEvolutionProgress(
  age: number,
  counts: InteractionCounts,
  species: CompanionSpecies,
  currentStage: CompanionStage,
): { nextStage: CompanionStage | null; boostsToNext: number; signatureAction: ActionType | null } {
  // eslint-disable-next-line security/detect-object-injection
  const signatureAction = SPECIES_PRIMARY_ACTION[species] ?? null;
  // eslint-disable-next-line security/detect-object-injection
  const boostCount = signatureAction ? (counts[signatureAction] ?? 0) : 0;
  const effectiveAge = age + boostCount * INTERACTION_BOOST_WEIGHT;
  // eslint-disable-next-line security/detect-object-injection
  const currentIdx = STAGE_INDEX[currentStage];

  if (currentIdx >= 3) return { nextStage: null, boostsToNext: 0, signatureAction };

  const nextStage = STAGES[currentIdx + 1] ?? null;
  if (!nextStage) return { nextStage: null, boostsToNext: 0, signatureAction };

  // eslint-disable-next-line security/detect-object-injection
  const nextThreshold = STAGE_THRESHOLDS[nextStage];
  const remainingEffective = Math.max(0, nextThreshold - effectiveAge);
  const boostsToNext = signatureAction
    ? Math.ceil(remainingEffective / INTERACTION_BOOST_WEIGHT)
    : 0;
  return { nextStage, boostsToNext, signatureAction };
}

// ─── EvolutionPanel — compact always-visible strip ────────────────────────────
// Fits in ~72px total height — no accordion, no scrolling required.
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

  const { nextStage, boostsToNext, signatureAction } = computeEvolutionProgress(
    age,
    interactionCounts,
    species,
    stage,
  );

  // ── Hint text ──────────────────────────────────────────────────────────────
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
      className={clsx('w-full rounded-2xl px-4 py-3', theme.panelBg)}
      role="region"
      aria-label={t('evolutionPanel.title')}
    >
      {/* ── Top row: label + hint ── */}
      <div className="mb-2 flex items-baseline gap-2">
        <span
          className={clsx(
            'shrink-0 text-[10px] font-bold uppercase tracking-widest',
            theme.accentText,
          )}
        >
          {t('evolutionPanel.title')}
        </span>
        <span
          className={clsx('flex-1 truncate text-right text-[10px] leading-snug', theme.hintText)}
        >
          {hint}
        </span>
      </div>

      {/* ── Stage progress strip ── */}
      <div className="flex w-full items-start" role="list">
        {STAGES.map((stageKey, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;

          const connectorStatus =
            idx < currentIdx ? 'completed' : idx === currentIdx ? 'in-progress' : 'future';

          return (
            <React.Fragment key={stageKey}>
              {/* Node + label */}
              <div role="listitem" className="flex flex-col items-center gap-1">
                {isCurrent ? (
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className={clsx(
                      'h-3.5 w-3.5 rounded-full ring-2 ring-offset-1',
                      theme.nodeFilled,
                      theme.nodeGlow,
                    )}
                    aria-hidden="true"
                  />
                ) : isPast ? (
                  <div
                    className={clsx('h-3 w-3 rounded-full', theme.nodeFilled)}
                    aria-hidden="true"
                  />
                ) : (
                  <div
                    className="h-3 w-3 rounded-full border-2 border-border-soft opacity-35"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={clsx(
                    'w-[48px] truncate text-center text-[9px] leading-none',
                    isCurrent && `font-semibold ${theme.accentText}`,
                    isPast && `font-medium ${theme.accentText} opacity-65`,
                    isFuture && 'font-normal text-ink-faint opacity-40',
                  )}
                >
                  {t(`species.${species}.stages.${stageKey}`)}
                </span>
              </div>

              {/* Connector */}
              {idx < 3 && (
                <div className="mb-[3px] mt-[6px] flex-1 self-start">
                  {connectorStatus === 'completed' ? (
                    <div className={clsx('h-0.5 w-full rounded-full', theme.connectorFilled)} />
                  ) : connectorStatus === 'in-progress' ? (
                    <div className="h-0 w-full border-t-2 border-dashed border-ink-faint/55" />
                  ) : (
                    <div className="h-0.5 w-full rounded-full bg-border-soft opacity-25" />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
