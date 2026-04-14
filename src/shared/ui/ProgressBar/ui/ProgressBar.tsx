import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0–100, already clamped
  label: string; // Pre-translated by parent
  colorClass: string; // Tailwind bg-* class, computed by parent based on value threshold
  showValue?: boolean;
}

export function ProgressBar({
  value,
  label,
  colorClass,
  showValue = false,
}: ProgressBarProps): React.JSX.Element {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-calm-text-muted text-sm font-medium">{label}</span>
        {showValue && <span className="text-calm-text-muted text-xs tabular-nums">{clamped}</span>}
      </div>
      <div
        className="bg-warm-white h-3 w-full overflow-hidden rounded-full border border-soft-gray/30"
        role="none"
      >
        {/*
          JUSTIFIED EXCEPTION to no-inline-styles rule (R3):
          Dynamic width % cannot be expressed as a static Tailwind class.
          Tailwind JIT w-[${value}%] is evaluated at build time, not runtime.
          This is the only approved use of style={{}} in the codebase.
        */}
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', colorClass)}
          // eslint-disable-next-line react/forbid-dom-props
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

/** Returns the appropriate Tailwind color class for a stat value (R7 — no alarming red). */
export function getStatColorClass(value: number): string {
  if (value > 60) return 'bg-sage';
  if (value >= 30) return 'bg-warm-peach';
  return 'bg-amber-400'; // Warm amber, not red — calmer for anxiety context
}
