import React from 'react';
import { useTranslation } from 'react-i18next';

// Sprint 0 stub — full implementation in Sprint 4
export function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white">
      <p className="text-calm-text">{t('settings')}</p>
    </div>
  );
}
