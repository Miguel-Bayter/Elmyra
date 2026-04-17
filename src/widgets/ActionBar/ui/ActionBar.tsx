import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { ActionType } from '@entities/companion';
import { useNourishPet } from '@features/nourish-pet';
import { usePlayWithPet } from '@features/play-with-pet';
import { useRestPet } from '@features/rest-pet';
import { useComfortPet } from '@features/comfort-pet';

// ─── Compact action card for horizontal row layout ────────────────────────────
interface ActionCardProps {
  onClick: () => void;
  label: string;
  emoji: string;
  isDisabled: boolean;
  colorClass: string;
  ringClass: string;
  ariaLabel: string;
}

function ActionCard({
  onClick,
  label,
  emoji,
  isDisabled,
  colorClass,
  ringClass,
  ariaLabel,
}: ActionCardProps): React.JSX.Element {
  return (
    // S4-FE-03: Framer Motion press feedback
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      whileTap={isDisabled ? {} : { scale: 0.9 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className={clsx(
        'flex flex-1 flex-col items-center justify-center gap-1.5',
        'rounded-2xl py-3 px-1 text-center',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        colorClass,
        ringClass,
        isDisabled ? 'cursor-not-allowed opacity-35' : 'hover:brightness-95',
      )}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-xs font-semibold text-ink leading-tight">{label}</span>
    </motion.button>
  );
}

interface ActionBarProps {
  /** Called with the action type immediately after a successful action tap */
  onAction?: (action: ActionType) => void;
}

export function ActionBar({ onAction }: ActionBarProps): React.JSX.Element {
  const { t } = useTranslation('actions');

  const { nourish, isDisabled: nourishDisabled } = useNourishPet();
  const { play, isDisabled: playDisabled } = usePlayWithPet();
  const { rest, isDisabled: restDisabled } = useRestPet();
  const { comfort, isDisabled: comfortDisabled } = useComfortPet();

  return (
    <div className="flex w-full gap-2">
      <ActionCard
        onClick={() => {
          nourish();
          onAction?.('nourish');
        }}
        label={t('nourish')}
        emoji="🍃"
        isDisabled={nourishDisabled}
        colorClass="bg-sage-mist"
        ringClass="focus-visible:ring-sage"
        ariaLabel={t('nourishDescription')}
      />
      <ActionCard
        onClick={() => {
          play();
          onAction?.('play');
        }}
        label={t('play')}
        emoji="✨"
        isDisabled={playDisabled}
        colorClass="bg-lavender-mist"
        ringClass="focus-visible:ring-lavender"
        ariaLabel={t('playDescription')}
      />
      <ActionCard
        onClick={() => {
          rest();
          onAction?.('rest');
        }}
        label={t('rest')}
        emoji="🌙"
        isDisabled={restDisabled}
        colorClass="bg-mint-mist"
        ringClass="focus-visible:ring-soft-mint"
        ariaLabel={t('restDescription')}
      />
      <ActionCard
        onClick={() => {
          comfort();
          onAction?.('comfort');
        }}
        label={t('comfort')}
        emoji="💜"
        isDisabled={comfortDisabled}
        colorClass="bg-peach-mist"
        ringClass="focus-visible:ring-warm-peach"
        ariaLabel={t('comfortDescription')}
      />
    </div>
  );
}
