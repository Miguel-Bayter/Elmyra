import React from 'react';
import { useTranslation } from 'react-i18next';

// Sprint 0 stub — full implementation in Sprint 3
export function WelcomePage(): React.JSX.Element {
  const { t } = useTranslation('legal');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white p-8">
      <h1 className="text-calm-text mb-4 text-2xl font-bold">{t('disclaimer.title')}</h1>
      <p className="text-calm-text-muted max-w-md text-center">{t('disclaimer.body')}</p>
    </div>
  );
}
