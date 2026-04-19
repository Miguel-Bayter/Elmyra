import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCompanionStore } from '@entities/companion';

interface Props {
  onClick: () => void;
}

export function BreathingButton({ onClick }: Props): React.JSX.Element {
  const { t } = useTranslation('actions');
  const isInRestMode = useCompanionStore((s) => s.companion?.isInRestMode ?? false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isInRestMode}
      whileTap={isInRestMode ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className="flex w-full items-center gap-2 rounded-xl border border-base-300 bg-base-200 px-3 py-2 text-left transition-colors duration-150 hover:bg-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3"
      aria-label={t('breathing.ariaLabel')}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        🌬️
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs font-medium leading-none text-base-content">
          {t('breathing.title')}
        </span>
        <span className="text-nano leading-none text-ink-muted">{t('breathing.subtitle')}</span>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4 flex-shrink-0 text-base-content/40"
      >
        <path
          d="M6 3l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}
