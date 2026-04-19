import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { useCompanionStore } from '@entities/companion';
import { Modal } from '@shared/ui/Modal';

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DURATION = 4; // seconds per phase
const TOTAL_CYCLES = 2;

const NEXT_PHASE: Record<BreathPhase, BreathPhase> = {
  inhale: 'hold1',
  hold1: 'exhale',
  exhale: 'hold2',
  hold2: 'inhale',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function BreathingModal({ isOpen, onClose, onComplete }: Props): React.JSX.Element {
  const { t } = useTranslation('actions');
  const name = useCompanionStore((s) => s.companion?.name ?? '');

  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(PHASE_DURATION);
  const [cycleCount, setCycleCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopTimer();
    setPhase('inhale');
    setSecondsLeft(PHASE_DURATION);
    setCycleCount(0);
    setIsDone(false);
  }, [stopTimer]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        setPhase((cur) => {
          // eslint-disable-next-line security/detect-object-injection
          const next = NEXT_PHASE[cur];
          if (next === 'inhale') {
            setCycleCount((c) => {
              const n = c + 1;
              if (n >= TOTAL_CYCLES) {
                stopTimer();
                setIsDone(true);
                onCompleteRef.current();
              }
              return n;
            });
          }
          return next;
        });

        return PHASE_DURATION;
      });
    }, 1000);

    return stopTimer;
  }, [isOpen, reset, stopTimer]);

  const isExpanded = phase === 'inhale' || phase === 'hold1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('breathing.title')}
      closeLabel={t('breathing.close')}
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {isDone ? (
          <>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-mint-mist text-5xl"
              aria-hidden="true"
            >
              🌿
            </motion.div>
            <p className="text-center text-base font-semibold text-ink">{t('breathing.done')}</p>
            <p className="text-center text-sm text-ink-secondary">
              {t('breathing.doneMessage', { name })}
            </p>
          </>
        ) : (
          <>
            {/* Breathing circle */}
            <div className="relative flex h-36 w-36 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full bg-lavender/30"
                animate={{ scale: isExpanded ? 1 : 0.62 }}
                transition={{ duration: PHASE_DURATION - 0.15, ease: 'easeInOut' }}
                aria-hidden="true"
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-lavender/50"
                animate={{ scale: isExpanded ? 1 : 0.55 }}
                transition={{ duration: PHASE_DURATION - 0.15, ease: 'easeInOut' }}
                aria-hidden="true"
              />
              <span
                className="relative z-10 text-3xl font-bold tabular-nums text-lavender-dark"
                aria-live="polite"
                aria-label={`${secondsLeft} ${t('breathing.seconds')}`}
              >
                {secondsLeft}
              </span>
            </div>

            {/* Phase label */}
            <p className="text-lg font-semibold text-ink" aria-live="polite">
              {t(`breathing.${phase}`)}
            </p>

            {/* Cycle progress dots */}
            <div
              className="flex gap-2"
              role="progressbar"
              aria-valuenow={cycleCount}
              aria-valuemax={TOTAL_CYCLES}
            >
              {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
                <span
                  key={i}
                  className={clsx(
                    'h-1.5 w-10 rounded-full transition-colors duration-500',
                    i < cycleCount ? 'bg-lavender' : 'bg-lavender/20',
                  )}
                />
              ))}
            </div>

            <p className="text-xs text-ink-muted">
              {t('breathing.cycle', { current: cycleCount + 1, total: TOTAL_CYCLES })}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
