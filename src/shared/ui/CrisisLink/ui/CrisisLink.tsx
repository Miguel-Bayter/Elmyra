import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Modal } from '../../Modal/ui/Modal';
import { CRISIS_COUNTRIES, defaultCountryForLang } from '@shared/config/crisisResources';
import { useCompanionStore } from '@entities/companion';

export function CrisisLink(): React.JSX.Element {
  const { t, i18n } = useTranslation(['common', 'legal']);
  const [isOpen, setIsOpen] = useState(false);

  const preferences = useCompanionStore((s) => s.preferences);
  const setCrisisCountry = useCompanionStore((s) => s.setCrisisCountry);

  const selectedCode = preferences.crisisCountry ?? defaultCountryForLang(i18n.language);

  const isES = i18n.language.startsWith('es');

  const selectedCountry =
    CRISIS_COUNTRIES.find((c) => c.code === selectedCode) ?? CRISIS_COUNTRIES[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t('crisisHelp', { ns: 'common' })}
        className="text-lavender hover:text-lavender/70 rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
        title={t('crisisHelp', { ns: 'common' })}
      >
        {/* Heart icon — understated, not alarming */}
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
        </svg>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('crisisResources.title', { ns: 'legal' })}
        closeLabel={t('close', { ns: 'common' })}
      >
        <p className="mb-4 text-sm text-ink-secondary">
          {t('crisisResources.subtitle', { ns: 'legal' })}
        </p>

        {/* Country selector */}
        <div className="mb-4">
          <label
            htmlFor="crisis-country"
            className="mb-1.5 block text-xs font-medium text-ink-muted"
          >
            {isES ? 'Tu país' : 'Your country'}
          </label>
          <select
            id="crisis-country"
            value={selectedCode}
            onChange={(e) => setCrisisCountry(e.target.value)}
            className="select select-bordered w-full bg-parchment text-ink text-sm focus:outline-none focus:border-lavender"
          >
            {CRISIS_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {isES ? country.nameES : country.nameEN}
              </option>
            ))}
          </select>
        </div>

        {/* Resources for selected country */}
        {selectedCountry !== undefined && (
          <ul className="space-y-3">
            {selectedCountry.resources.map((resource) => (
              <li
                key={resource.name}
                className="rounded-2xl border border-card bg-parchment-warm px-4 py-3"
              >
                <p className="font-semibold text-ink text-sm">{resource.name}</p>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    'mt-2 flex items-center gap-2 rounded-xl px-3 py-2',
                    'text-sm font-medium transition-colors',
                    resource.isText
                      ? 'bg-mint-mist text-sage-dark hover:bg-soft-mint/30'
                      : 'bg-lavender-mist text-lavender-dark hover:bg-lavender-light',
                  )}
                >
                  {/* Icon: phone or message */}
                  {resource.isText ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 shrink-0"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 shrink-0"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
                    </svg>
                  )}
                  <span>{resource.phone}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
