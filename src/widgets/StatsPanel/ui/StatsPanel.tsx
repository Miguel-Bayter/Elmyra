import React from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { useCompanionStore, CRITICAL_THRESHOLD } from '@entities/companion';
import { getStatColorClass } from '@shared/ui/ProgressBar';

const criticalTransition: Transition = { repeat: Infinity, duration: 2.5, ease: 'easeInOut' };
const criticalAnimate = { opacity: [1, 0.5, 1] };

const STAT_CONFIG = [
  { key: 'nourishment', emoji: '🍃' },
  { key: 'joy', emoji: '✨' },
  { key: 'energy', emoji: '⚡' },
  { key: 'vitality', emoji: '💎' },
] as const;

// ─── StatsPanel — compact 4-column single row ─────────────────────────────────
// Each cell: emoji + number + thin bar. Fits in ~52px total height.
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
    <div className="flex w-full gap-1.5 rounded-2xl bg-parchment-warm px-3 py-2.5">
      {STAT_CONFIG.map(({ key, emoji }) => {
        // Safe: key is a typed const from STAT_CONFIG — never user-supplied
        // eslint-disable-next-line security/detect-object-injection
        const value = values[key] ?? 0;
        const clamped = Math.min(100, Math.max(0, Math.round(value)));
        const isCritical = value < CRITICAL_THRESHOLD;
        const colorClass = getStatColorClass(value);
        const label = t(`stats.${key}`);

        return (
          <motion.div
            key={key}
            className="flex flex-1 flex-col items-center gap-1"
            animate={isCritical ? criticalAnimate : {}}
            transition={isCritical ? criticalTransition : {}}
            aria-label={`${label}: ${clamped}`}
          >
            {/* Emoji + number */}
            <div className="flex items-baseline gap-1">
              <span className="text-sm leading-none" aria-hidden="true">
                {emoji}
              </span>
              <span
                className={clsx(
                  'text-xs font-bold tabular-nums',
                  isCritical ? 'text-amber-400' : 'text-ink-secondary',
                )}
              >
                {clamped}
              </span>
            </div>
            {/* Thin progress bar */}
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
