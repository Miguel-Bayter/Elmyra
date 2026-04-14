import React from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { useCompanionStore, CRITICAL_THRESHOLD } from '@entities/companion';
import { getStatColorClass } from '@shared/ui/ProgressBar';

// S4-FE-06: Gentle opacity pulse for critical stats (R7 — never flashing)
const criticalTransition: Transition = {
  repeat: Infinity,
  duration: 2.5,
  ease: 'easeInOut',
};
const criticalAnimate = { opacity: [1, 0.55, 1] };

// ─── Stat config — emoji + translation key ────────────────────────────────────
const STAT_CONFIG = [
  { key: 'nourishment', emoji: '🍃' },
  { key: 'joy', emoji: '✨' },
  { key: 'energy', emoji: '⚡' },
  { key: 'vitality', emoji: '💎' },
] as const;

// ─── Mini stat card ────────────────────────────────────────────────────────────
interface StatCardProps {
  emoji: string;
  label: string;
  value: number;
  isCritical: boolean;
}

function StatCard({ emoji, label, value, isCritical }: StatCardProps): React.JSX.Element {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const colorClass = getStatColorClass(value);

  return (
    <motion.div
      className="flex flex-col gap-1.5 rounded-2xl bg-parchment-warm px-3 py-2.5"
      animate={isCritical ? criticalAnimate : {}}
      transition={isCritical ? criticalTransition : {}}
    >
      {/* Top row: emoji + label + value */}
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none" aria-hidden="true">
          {emoji}
        </span>
        <span
          className={clsx(
            'flex-1 text-xs font-medium truncate transition-colors duration-300',
            isCritical ? 'text-amber-400' : 'text-ink-secondary',
          )}
        >
          {label}
        </span>
        <span className="text-xs tabular-nums font-semibold text-ink-muted">{clamped}</span>
      </div>

      {/* Progress bar — thin, native <progress> (R3: no inline style) */}
      <progress
        className={clsx('progress h-1.5 w-full', colorClass)}
        value={clamped}
        max={100}
        aria-label={label}
        aria-valuenow={clamped}
      />
    </motion.div>
  );
}

// ─── StatsPanel ───────────────────────────────────────────────────────────────
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
    <div className="grid w-full grid-cols-2 gap-2">
      {STAT_CONFIG.map(({ key, emoji }) => {
        // Safe: key is a typed const from STAT_CONFIG — never user-supplied
        // eslint-disable-next-line security/detect-object-injection
        const value = values[key] ?? 0;
        return (
          <StatCard
            key={key}
            emoji={emoji}
            label={t(`stats.${key}`)}
            value={value}
            isCritical={value < CRITICAL_THRESHOLD}
          />
        );
      })}
    </div>
  );
}
