import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0–100, already clamped
  label: string; // Pre-translated by parent
  colorClass: string; // DaisyUI progress-* class, computed by parent
  showValue?: boolean;
  isCritical?: boolean; // True when value < CRITICAL_THRESHOLD — drives Sprint 4 pulse
}

export function ProgressBar({
  value,
  label,
  colorClass,
  showValue = false,
  isCritical = false,
}: ProgressBarProps): React.JSX.Element {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span
          className={clsx(
            'text-sm font-medium transition-colors duration-300',
            isCritical ? 'text-amber-400' : 'text-ink-muted',
          )}
        >
          {label}
        </span>
        {showValue && <span className="text-xs tabular-nums text-ink-faint">{clamped}</span>}
      </div>
      {/*
        Native <progress> with DaisyUI progress class.
        The `value` / `max` HTML attributes drive width via browser CSS — zero inline style.
        R3 fully satisfied: no style={{}} anywhere in the codebase.
      */}
      <progress
        className={clsx('progress h-3 w-full', colorClass)}
        value={clamped}
        max={100}
        aria-label={label}
      />
    </div>
  );
}

/** Returns the DaisyUI progress color class for a stat value (R7 — no alarming red). */
export function getStatColorClass(value: number): string {
  if (value > 60) return 'progress-success'; // sage
  if (value >= 30) return 'progress-warning'; // warm-peach
  return 'progress-error'; // warm amber — never red
}
