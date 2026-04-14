import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../Modal/ui/Modal';
import { CRISIS_RESOURCES } from '@shared/config/crisisResources';

export function CrisisLink(): React.JSX.Element {
  const { t, i18n } = useTranslation(['common', 'legal']);
  const [isOpen, setIsOpen] = useState(false);

  const lang = i18n.language.startsWith('es') ? 'es' : 'en';
  // eslint-disable-next-line security/detect-object-injection
  const resources = CRISIS_RESOURCES[lang] ?? CRISIS_RESOURCES['en'] ?? [];

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
        <p className="mb-4">{t('crisisResources.subtitle', { ns: 'legal' })}</p>
        <ul className="space-y-4">
          {resources.map((resource) => (
            <li key={resource.name} className="rounded-xl border border-soft-gray/30 p-3">
              <p className="text-calm-text font-semibold">{resource.name}</p>
              <p className="text-calm-text-muted text-xs">{resource.description}</p>
              <p className="mt-1 font-mono text-sm">
                {t('crisisResources.callLabel', { ns: 'legal' })}: {resource.phone}
              </p>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
