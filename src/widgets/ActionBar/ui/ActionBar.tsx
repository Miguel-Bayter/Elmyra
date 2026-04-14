import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { useNourishPet } from '@features/nourish-pet';
import { usePlayWithPet } from '@features/play-with-pet';
import { useRestPet } from '@features/rest-pet';
import { useComfortPet } from '@features/comfort-pet';

// Action card — more expressive than a plain button
interface ActionCardProps {
  onClick: () => void;
  label: string;
  description: string;
  emoji: string;
  isDisabled: boolean;
  colorClass: string;
  ringClass: string;
}

function ActionCard({
  onClick,
  label,
  description,
  emoji,
  isDisabled,
  colorClass,
  ringClass,
}: ActionCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={description}
      className={clsx(
        'flex flex-col items-center gap-2 rounded-3xl p-4 text-center',
        'min-h-[100px] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        colorClass,
        ringClass,
        isDisabled ? 'cursor-not-allowed opacity-35' : 'hover:scale-[1.03] active:scale-[0.98]',
      )}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="text-xs leading-snug text-ink-muted">{description}</span>
    </button>
  );
}

export function ActionBar(): React.JSX.Element {
  const { t } = useTranslation('actions');

  const { nourish, isDisabled: nourishDisabled } = useNourishPet();
  const { play, isDisabled: playDisabled } = usePlayWithPet();
  const { rest, isDisabled: restDisabled } = useRestPet();
  const { comfort, isDisabled: comfortDisabled } = useComfortPet();

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <ActionCard
        onClick={nourish}
        label={t('nourish')}
        description={t('nourishDescription')}
        emoji="🍃"
        isDisabled={nourishDisabled}
        colorClass="bg-sage-mist"
        ringClass="focus-visible:ring-sage"
      />
      <ActionCard
        onClick={play}
        label={t('play')}
        description={t('playDescription')}
        emoji="✨"
        isDisabled={playDisabled}
        colorClass="bg-lavender-mist"
        ringClass="focus-visible:ring-lavender"
      />
      <ActionCard
        onClick={rest}
        label={t('rest')}
        description={t('restDescription')}
        emoji="🌙"
        isDisabled={restDisabled}
        colorClass="bg-mint-mist"
        ringClass="focus-visible:ring-soft-mint"
      />
      <ActionCard
        onClick={comfort}
        label={t('comfort')}
        description={t('comfortDescription')}
        emoji="💜"
        isDisabled={comfortDisabled}
        colorClass="bg-peach-mist"
        ringClass="focus-visible:ring-warm-peach"
      />
    </div>
  );
}
