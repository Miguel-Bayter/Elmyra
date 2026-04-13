import { useEffect, useRef } from 'react';
import { useCompanionStore } from '@entities/companion/model/companionStore';

// ─── Nudge thresholds ─────────────────────────────────────────────────────────
// Gentle, not alarming. These are suggestions, not warnings (R7).
const NUDGE_THRESHOLD = 30;

// Cooldown between any two nudges — max 1 nudge per 5 minutes (R7: no spam)
const NUDGE_COOLDOWN_MS = 5 * 60 * 1000;

// Minimum gap between consecutive nudge checks
const NUDGE_CHECK_INTERVAL_MS = 30_000; // 30 seconds

export type NudgeKey = 'nourishment' | 'rest' | 'joy' | 'vitality';

export type NudgeHandler = (key: NudgeKey) => void;

/**
 * Monitors companion stats and calls onNudge when a stat falls below the
 * gentle threshold. Rate-limited to 1 nudge per 5 minutes.
 *
 * No nudges when:
 * - No companion exists
 * - Companion is in rest mode (they need care, not a wellness nudge)
 * - Within NUDGE_COOLDOWN_MS of the previous nudge
 *
 * The onNudge handler receives a key that maps to `wellness.nudges.*` i18n keys.
 * Translation happens in the UI layer, not here (R2).
 */
export const useWellnessNudge = (onNudge: NudgeHandler): void => {
  const companion = useCompanionStore((state) => state.companion);
  const lastNudgeRef = useRef<number>(0);

  useEffect(() => {
    if (!companion || companion.isInRestMode || companion.isResting) return;

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      if (now - lastNudgeRef.current < NUDGE_COOLDOWN_MS) return;

      // Priority: nourishment → energy → joy → vitality
      // Only one nudge per check cycle — avoid overwhelming the user
      if (companion.nourishment < NUDGE_THRESHOLD) {
        lastNudgeRef.current = now;
        onNudge('nourishment');
      } else if (companion.energy < NUDGE_THRESHOLD) {
        lastNudgeRef.current = now;
        onNudge('rest');
      } else if (companion.joy < NUDGE_THRESHOLD) {
        lastNudgeRef.current = now;
        onNudge('joy');
      } else if (companion.vitality < NUDGE_THRESHOLD) {
        lastNudgeRef.current = now;
        onNudge('vitality');
      }
    }, NUDGE_CHECK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [companion, onNudge]);
};
