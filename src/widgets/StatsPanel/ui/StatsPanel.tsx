import React from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { useCompanionStore, CRITICAL_THRESHOLD } from '@entities/companion';
import { getStatColorClass } from '@shared/ui/ProgressBar';

const criticalTransition: Transition = { repeat: Infinity, duration: 2.2, ease: 'easeInOut' };
const criticalAnimate = { opacity: [1, 0.45, 1] };

interface StatConfig {
  key: 'nourishment' | 'joy' | 'energy' | 'vitality';
  emoji: string;
  barColor: string; // fallback when not critical
}

const STAT_CONFIG: StatConfig[] = [
  { key: 'nourishment', emoji: '🍃', barColor: 'progress-accent' },
  { key: 'joy', emoji: '✨', barColor: 'progress-warning' },
  { key: 'energy', emoji: '⚡', barColor: 'progress-warning' },
  { key: 'vitality', emoji: '💎', barColor: 'progress-primary' },
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
    <div className="grid w-full grid-cols-4 gap-1" role="list">
      {STAT_CONFIG.map(({ key, emoji, barColor }) => {
        // eslint-disable-next-line security/detect-object-injection
        const value = values[key] ?? 0;
        const clamped = Math.min(100, Math.max(0, Math.round(value)));
        const isCritical = value < CRITICAL_THRESHOLD;
        const colorClass = getStatColorClass(value);
        const label = t(`stats.${key}`);

        return (
          <motion.div
            key={key}
            role="listitem"
            className="flex flex-col items-center gap-1"
            animate={isCritical ? criticalAnimate : {}}
            transition={isCritical ? criticalTransition : {}}
            aria-label={`${label}: ${clamped}`}
          >
            {/* Emoji + value */}
            <div className="flex items-baseline gap-0.5 leading-none">
              <span className="text-sm" aria-hidden="true">
                {emoji}
              </span>
              <span
                className={clsx(
                  'text-nano font-medium tabular-nums sm:text-tiny',
                  isCritical ? 'text-amber-400' : 'text-ink-muted',
                )}
              >
                {clamped}
              </span>
            </div>

            {/* Progress bar */}
            <progress
              className={clsx('progress h-bar w-full sm:h-1', colorClass || barColor)}
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
