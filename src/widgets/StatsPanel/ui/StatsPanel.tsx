import React from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { useCompanionStore, CRITICAL_THRESHOLD } from '@entities/companion';
import { getStatColorClass } from '@shared/ui/ProgressBar';

const criticalTransition: Transition = { repeat: Infinity, duration: 2.5, ease: 'easeInOut' };
const criticalAnimate = { opacity: [1, 0.55, 1] };

interface StatConfig {
  key: 'nourishment' | 'joy' | 'energy' | 'vitality';
  emoji: string;
  accentBorder: string;
  dotColor: string;
}

const STAT_CONFIG: StatConfig[] = [
  { key: 'nourishment', emoji: '🍃', accentBorder: 'border-l-soft-mint', dotColor: 'bg-soft-mint' },
  { key: 'joy', emoji: '✨', accentBorder: 'border-l-golden', dotColor: 'bg-golden' },
  { key: 'energy', emoji: '⚡', accentBorder: 'border-l-warm-peach', dotColor: 'bg-warm-peach' },
  { key: 'vitality', emoji: '💎', accentBorder: 'border-l-lavender', dotColor: 'bg-lavender' },
];

export function StatsPanel(): React.JSX.Element | null {
  const { t } = useTranslation('pet');

  const nourishment = useCompanionStore((s) => s.companion?.nourishment ?? 0);
  const joy = useCompanionStore((s) => s.companion?.joy ?? 0);
  const energy = useCompanionStore((s) => s.companion?.energy ?? 0);
  const vitality = useCompanionStore((s) => s.companion?.vitality ?? 0);
  const hasCompanion = useCompanionStore((s) => s.companion !== null);

  if (!hasCompanion) return null;

  const values: Record<string, number> = { nourishment, joy, energy, vitality };

  return (
    <div className="flex w-full gap-1.5">
      {STAT_CONFIG.map(({ key, emoji, accentBorder, dotColor }) => {
        // eslint-disable-next-line security/detect-object-injection
        const value = values[key] ?? 0;
        const clamped = Math.min(100, Math.max(0, Math.round(value)));
        const isCritical = value < CRITICAL_THRESHOLD;
        const colorClass = getStatColorClass(value);
        const label = t(`stats.${key}`);

        return (
          <motion.div
            key={key}
            className={clsx(
              'flex flex-1 flex-col gap-1.5 rounded-xl border border-border-medium border-l-2 bg-parchment-deep py-2 pl-2.5 pr-2 min-w-0',
              accentBorder,
            )}
            animate={isCritical ? criticalAnimate : {}}
            transition={isCritical ? criticalTransition : {}}
            aria-label={`${label}: ${clamped}`}
          >
            {/* Dot + label */}
            <div className="flex items-center gap-1 min-w-0">
              <span
                className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)}
                aria-hidden="true"
              />
              <span
                className={clsx(
                  'truncate text-[9px] font-bold uppercase tracking-wide leading-none',
                  isCritical ? 'text-amber-400' : 'text-ink-muted',
                )}
              >
                {label}
              </span>
            </div>

            {/* Value + emoji inline */}
            <div className="flex items-baseline gap-1">
              <span
                className={clsx(
                  'text-lg font-bold tabular-nums leading-none',
                  isCritical ? 'text-amber-400' : 'text-ink',
                )}
              >
                {clamped}
              </span>
              <span className="text-xs leading-none" aria-hidden="true">
                {emoji}
              </span>
            </div>

            {/* Progress bar */}
            <progress
              className={clsx('progress h-1 w-full', colorClass)}
              value={clamped}
              max={100}
              aria-hidden="true"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
