import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
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

  const handleThemeChange = (newTheme: 'light' | 'dark'): void => {
    setTheme(newTheme);
    // Apply data-theme to root — triggers [data-theme="dark"] CSS vars
    document.documentElement.dataset['theme'] = newTheme;
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
          className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← {t('back', { ns: 'common' })}
        </Link>

        <h1 className="text-xl font-semibold text-ink">{t('settings', { ns: 'common' })}</h1>

        {/* Language — join group */}
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t('language', { ns: 'common' })}
          </h2>
          <div className="join">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={clsx(
                'join-item btn btn-sm',
                preferences.language === 'en'
                  ? 'btn-primary'
                  : 'btn-ghost border border-[rgba(45,37,32,0.12)]',
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('es')}
              className={clsx(
                'join-item btn btn-sm',
                preferences.language === 'es'
                  ? 'btn-primary'
                  : 'btn-ghost border border-[rgba(45,37,32,0.12)]',
              )}
            >
              Español
            </button>
          </div>
        </section>

        {/* Theme — join group */}
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t('theme', { ns: 'common' })}
          </h2>
          <div className="join">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={clsx(
                'join-item btn btn-sm',
                preferences.theme === 'light'
                  ? 'btn-primary'
                  : 'btn-ghost border border-[rgba(45,37,32,0.12)]',
              )}
            >
              {t('themeLight', { ns: 'common' })}
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={clsx(
                'join-item btn btn-sm',
                preferences.theme === 'dark'
                  ? 'btn-primary'
                  : 'btn-ghost border border-[rgba(45,37,32,0.12)]',
              )}
            >
              {t('themeDark', { ns: 'common' })}
            </button>
          </div>
        </section>

        {/* Crisis resources — DaisyUI list */}
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t('crisisResources.title', { ns: 'legal' })}
          </h2>
          <p className="text-xs text-ink-muted">{t('crisisResources.subtitle', { ns: 'legal' })}</p>
          <ul className="list bg-parchment rounded-2xl border-card">
            {crisisResources.map((r) => (
              <li key={r.name} className="list-row px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{r.name}</p>
                  <p className="text-xs text-ink-muted">{r.description}</p>
                  <p className="mt-0.5 font-mono text-xs text-ink-secondary">
                    {t('crisisResources.callLabel', { ns: 'legal' })}: {r.phone}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Privacy */}
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t('privacy.title', { ns: 'legal' })}
          </h2>
          <p className="text-xs leading-relaxed text-ink-muted">
            {t('privacy.body', { ns: 'legal' })}
          </p>
        </section>

        {/* Danger zone */}
        <section className="space-y-2 rounded-2xl border border-warm-peach/30 p-4">
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
