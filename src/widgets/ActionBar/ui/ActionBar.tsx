import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActionType } from '@entities/companion';
import { useNourishPet } from '@features/nourish-pet';
import { usePlayWithPet } from '@features/play-with-pet';
import { useRestPet } from '@features/rest-pet';
import { useComfortPet } from '@features/comfort-pet';

// Intent: uniform neutral surface — the EMOJI is the identity, not a colored blob.
// Depth: surface-shift only (base-100 → base-200 → base-300). No shadows, no colored bg.
// This works identically in light and dark because DaisyUI base tokens are theme-aware.

interface ActionConfig {
  action: ActionType;
  emoji: string;
  label: string; // used for aria only; visual label comes from i18n
}

const ACTION_CONFIG: ActionConfig[] = [
  { action: 'nourish', emoji: '🍃', label: 'nourish' },
  { action: 'play', emoji: '✨', label: 'play' },
  { action: 'rest', emoji: '🌙', label: 'rest' },
  { action: 'comfort', emoji: '💜', label: 'comfort' },
];

interface ActionCardProps {
  action: ActionType;
  emoji: string;
  onClick: () => void;
  label: string;
  isDisabled: boolean;
  ariaLabel: string;
  isHighlighted?: boolean;
  highlightLabel?: string | undefined;
}

function ActionCard({
  emoji,
  onClick,
  label,
  isDisabled,
  ariaLabel,
  isHighlighted,
  highlightLabel,
}: ActionCardProps): React.JSX.Element {
  return (
    <div className="relative">
      {/* Onboarding tooltip */}
      <AnimatePresence>
        {isHighlighted && highlightLabel && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-primary px-3 py-1 text-nano font-semibold text-primary-content shadow-lg"
          >
            {highlightLabel}
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel}
        whileTap={isDisabled ? {} : { scale: 0.91 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className={clsx(
          'flex w-full flex-col items-center justify-center gap-1',
          'rounded-xl border border-base-300 bg-base-200',
          'py-3 px-1 text-center',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          isHighlighted && 'ring-2 ring-primary/40 border-primary/40',
          isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-base-300 active:bg-base-300',
        )}
      >
        <span className="text-2xl leading-none" aria-hidden="true">
          {emoji}
        </span>
        <span className="text-nano font-normal leading-none text-base-content/50">{label}</span>
      </motion.button>
    </div>
  );
}

interface ActionBarProps {
  onAction?: (action: ActionType) => void;
  highlightAction?: ActionType | null;
  highlightLabel?: string | undefined;
}

export function ActionBar({
  onAction,
  highlightAction,
  highlightLabel,
}: ActionBarProps): React.JSX.Element {
  const { t } = useTranslation('actions');

  const { nourish, isDisabled: nourishDisabled } = useNourishPet();
  const { play, isDisabled: playDisabled } = usePlayWithPet();
  const { rest, isDisabled: restDisabled } = useRestPet();
  const { comfort, isDisabled: comfortDisabled } = useComfortPet();

  const handlers: Record<ActionType, { fn: () => void; isDisabled: boolean }> = {
    nourish: { fn: nourish, isDisabled: nourishDisabled },
    play: { fn: play, isDisabled: playDisabled },
    rest: { fn: rest, isDisabled: restDisabled },
    comfort: { fn: comfort, isDisabled: comfortDisabled },
  };

  return (
    <div className="grid w-full grid-cols-4 gap-1.5">
      {ACTION_CONFIG.map((config) => {
        const { fn, isDisabled } = handlers[config.action];
        return (
          <ActionCard
            key={config.action}
            action={config.action}
            emoji={config.emoji}
            onClick={() => {
              fn();
              onAction?.(config.action);
            }}
            label={t(config.action)}
            isDisabled={isDisabled}
            ariaLabel={t(`${config.action}Description`)}
            isHighlighted={highlightAction === config.action}
            highlightLabel={highlightAction === config.action ? highlightLabel : undefined}
          />
        );
      })}
    </div>
  );
}
