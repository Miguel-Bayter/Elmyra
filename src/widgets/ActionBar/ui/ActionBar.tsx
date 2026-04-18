import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActionType } from '@entities/companion';
import { useNourishPet } from '@features/nourish-pet';
import { usePlayWithPet } from '@features/play-with-pet';
import { useRestPet } from '@features/rest-pet';
import { useComfortPet } from '@features/comfort-pet';

interface ActionConfig {
  action: ActionType;
  emoji: string;
  circleBg: string;
}

const ACTION_CONFIG: ActionConfig[] = [
  { action: 'nourish', emoji: '🍃', circleBg: 'bg-mint-mist' },
  { action: 'play', emoji: '✨', circleBg: 'bg-golden-mist' },
  { action: 'rest', emoji: '🌙', circleBg: 'bg-lavender-mist' },
  { action: 'comfort', emoji: '💜', circleBg: 'bg-peach-mist' },
];

interface ActionCardProps {
  config: ActionConfig;
  onClick: () => void;
  label: string;
  isDisabled: boolean;
  ariaLabel: string;
  isHighlighted?: boolean;
  highlightLabel?: string | undefined;
}

function ActionCard({
  config,
  onClick,
  label,
  isDisabled,
  ariaLabel,
  isHighlighted,
  highlightLabel,
}: ActionCardProps): React.JSX.Element {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* Onboarding tooltip — floats above button */}
      <AnimatePresence>
        {isHighlighted && highlightLabel && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-lavender px-2 py-1 text-[10px] font-semibold text-white shadow-md"
          >
            {highlightLabel}
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-lavender" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel}
        whileTap={isDisabled ? {} : { scale: 0.92 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className={clsx(
          'flex w-full flex-col items-center justify-center gap-1.5',
          'rounded-2xl py-2.5 px-1 text-center',
          'border bg-parchment-deep',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-2',
          isHighlighted
            ? 'border-lavender/50 ring-2 ring-lavender/30 ring-offset-1'
            : 'border-border-medium',
          isDisabled
            ? 'cursor-not-allowed opacity-35'
            : 'hover:border-lavender/35 hover:bg-parchment-warm',
        )}
      >
        {/* Emoji in tinted circle */}
        <span
          className={clsx(
            'flex h-9 w-9 items-center justify-center rounded-full text-xl',
            config.circleBg,
          )}
          aria-hidden="true"
        >
          {config.emoji}
        </span>

        <span className="text-[10px] font-semibold leading-tight text-ink-secondary">{label}</span>
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
    <div className="flex w-full gap-1.5">
      {ACTION_CONFIG.map((config) => {
        const { fn, isDisabled } = handlers[config.action];
        return (
          <ActionCard
            key={config.action}
            config={config}
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
