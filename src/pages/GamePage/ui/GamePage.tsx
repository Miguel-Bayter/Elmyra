import React from 'react';
import { useTranslation } from 'react-i18next';

// Sprint 0 stub — full implementation in Sprint 3
export function GamePage(): React.JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white">
      <p className="text-calm-text">{t('appTitle')} — Game</p>
    </div>
  );
}
