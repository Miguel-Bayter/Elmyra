import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useCompanionStore } from '@entities/companion';
import { AppLayout } from '@widgets/AppLayout';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { CRISIS_RESOURCES } from '@shared/config/crisisResources';

export function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation(['common', 'legal']);
  const navigate = useNavigate();

  const preferences = useCompanionStore((s) => s.preferences);
  const setTheme = useCompanionStore((s) => s.setTheme);
  const setLanguage = useCompanionStore((s) => s.setLanguage);
  const deleteAllData = useCompanionStore((s) => s.deleteAllData);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const lang = preferences.language.startsWith('es') ? 'es' : 'en';
  // eslint-disable-next-line security/detect-object-injection
  const crisisResources = CRISIS_RESOURCES[lang] ?? CRISIS_RESOURCES['en'] ?? [];

  const handleLanguageChange = (newLang: 'en' | 'es'): void => {
    setLanguage(newLang);
    void i18n.changeLanguage(newLang);
  };

  const handleDeleteConfirmed = (): void => {
    deleteAllData();
    setShowDeleteConfirm(false);
    void navigate('/');
  };

  return (
    <AppLayout>
      <div className="w-full max-w-sm space-y-6 px-4 py-6">
        {/* Back */}
        <Link
          to="/companion"
          className="text-calm-text-muted hover:text-calm-text inline-flex items-center gap-1 text-sm transition-colors"
        >
          ← {t('back', { ns: 'common' })}
        </Link>

        <h1 className="text-calm-text text-xl font-semibold">{t('settings', { ns: 'common' })}</h1>

        {/* Language */}
        <section className="space-y-2">
          <h2 className="text-calm-text-muted text-sm font-medium uppercase tracking-wide">
            {t('language', { ns: 'common' })}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleLanguageChange('en')}
              label="English"
              variant={preferences.language === 'en' ? 'primary' : 'secondary'}
              size="sm"
            />
            <Button
              onClick={() => handleLanguageChange('es')}
              label="Español"
              variant={preferences.language === 'es' ? 'primary' : 'secondary'}
              size="sm"
            />
          </div>
        </section>

        {/* Theme */}
        <section className="space-y-2">
          <h2 className="text-calm-text-muted text-sm font-medium uppercase tracking-wide">
            {t('theme', { ns: 'common' })}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setTheme('light')}
              label={t('themeLight', { ns: 'common' })}
              variant={preferences.theme === 'light' ? 'primary' : 'secondary'}
              size="sm"
            />
            <Button
              onClick={() => setTheme('dark')}
              label={t('themeDark', { ns: 'common' })}
              variant={preferences.theme === 'dark' ? 'primary' : 'secondary'}
              size="sm"
            />
          </div>
        </section>

        {/* Crisis resources */}
        <section className="space-y-2">
          <h2 className="text-calm-text-muted text-sm font-medium uppercase tracking-wide">
            {t('crisisResources.title', { ns: 'legal' })}
          </h2>
          <p className="text-calm-text-muted text-xs">
            {t('crisisResources.subtitle', { ns: 'legal' })}
          </p>
          <ul className="space-y-2">
            {crisisResources.map((r) => (
              <li key={r.name} className="border-soft-gray/30 rounded-xl border p-3 text-sm">
                <p className="text-calm-text font-medium">{r.name}</p>
                <p className="text-calm-text-muted text-xs">{r.description}</p>
                <p className="mt-0.5 font-mono text-xs">
                  {t('crisisResources.callLabel', { ns: 'legal' })}: {r.phone}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Privacy */}
        <section className="space-y-2">
          <h2 className="text-calm-text-muted text-sm font-medium uppercase tracking-wide">
            {t('privacy.title', { ns: 'legal' })}
          </h2>
          <p className="text-calm-text-muted text-xs leading-relaxed">
            {t('privacy.body', { ns: 'legal' })}
          </p>
        </section>

        {/* Danger zone */}
        <section className="border-warm-peach/40 space-y-2 rounded-xl border p-4">
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            label={t('deleteAllData', { ns: 'common' })}
            variant="danger"
            size="md"
          />
        </section>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('deleteAllData', { ns: 'common' })}
        closeLabel={t('cancel', { ns: 'common' })}
      >
        <p className="mb-6">{t('deleteAllConfirm', { ns: 'common' })}</p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleDeleteConfirmed}
            label={t('deleteAllConfirmButton', { ns: 'common' })}
            variant="danger"
            size="md"
          />
          <Button
            onClick={() => setShowDeleteConfirm(false)}
            label={t('deleteAllCancelButton', { ns: 'common' })}
            variant="secondary"
            size="md"
          />
        </div>
      </Modal>
    </AppLayout>
  );
}
