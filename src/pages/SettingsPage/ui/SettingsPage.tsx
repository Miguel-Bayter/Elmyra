import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import i18n from 'i18next';
import { useCompanionStore } from '@entities/companion';
import { AppLayout } from '@widgets/AppLayout';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { CRISIS_COUNTRIES, defaultCountryForLang } from '@shared/config/crisisResources';

export function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation(['common', 'legal']);
  const navigate = useNavigate();

  const preferences = useCompanionStore((s) => s.preferences);
  const setTheme = useCompanionStore((s) => s.setTheme);
  const setLanguage = useCompanionStore((s) => s.setLanguage);
  const deleteAllData = useCompanionStore((s) => s.deleteAllData);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isES = preferences.language.startsWith('es');
  const [crisisCountryCode, setCrisisCountryCode] = useState(() =>
    defaultCountryForLang(preferences.language),
  );
  const crisisCountry =
    CRISIS_COUNTRIES.find((c) => c.code === crisisCountryCode) ?? CRISIS_COUNTRIES[0];

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

        {/* Crisis resources */}
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t('crisisResources.title', { ns: 'legal' })}
          </h2>
          <p className="text-xs text-ink-muted">{t('crisisResources.subtitle', { ns: 'legal' })}</p>

          {/* Country selector */}
          <select
            value={crisisCountryCode}
            onChange={(e) => setCrisisCountryCode(e.target.value)}
            aria-label={isES ? 'Seleccionar país' : 'Select country'}
            className="select select-bordered select-sm w-full bg-parchment text-ink focus:outline-none focus:border-lavender"
          >
            {CRISIS_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {isES ? country.nameES : country.nameEN}
              </option>
            ))}
          </select>

          {crisisCountry !== undefined && (
            <ul className="space-y-2">
              {crisisCountry.resources.map((r) => (
                <li
                  key={r.name}
                  className="rounded-2xl border border-card bg-parchment-warm px-4 py-3 text-sm"
                >
                  <p className="font-medium text-ink">{r.name}</p>
                  <p className="mt-1 font-mono text-xs text-ink-secondary">{r.phone}</p>
                </li>
              ))}
            </ul>
          )}
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
