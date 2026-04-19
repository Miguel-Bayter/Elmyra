// i18n initialized BEFORE any React component renders (imported in main.tsx first — R2)
// Translations are bundled as static imports — no HTTP backend needed.
// This ensures translations are available synchronously on first render.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── EN ────────────────────────────────────────────────────────────────────────
import enCommon from '../../../public/locales/en/common.json';
import enPet from '../../../public/locales/en/pet.json';
import enActions from '../../../public/locales/en/actions.json';
import enWellness from '../../../public/locales/en/wellness.json';
import enErrors from '../../../public/locales/en/errors.json';
import enNotifications from '../../../public/locales/en/notifications.json';
import enLegal from '../../../public/locales/en/legal.json';
import enJournal from '../../../public/locales/en/journal.json';

// ── ES ────────────────────────────────────────────────────────────────────────
import esCommon from '../../../public/locales/es/common.json';
import esPet from '../../../public/locales/es/pet.json';
import esActions from '../../../public/locales/es/actions.json';
import esWellness from '../../../public/locales/es/wellness.json';
import esErrors from '../../../public/locales/es/errors.json';
import esNotifications from '../../../public/locales/es/notifications.json';
import esLegal from '../../../public/locales/es/legal.json';
import esJournal from '../../../public/locales/es/journal.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    ns: ['common', 'pet', 'actions', 'wellness', 'errors', 'notifications', 'legal', 'journal'],
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false, // React JSX auto-escapes — no double-escaping needed
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'elmyra_language',
    },
    // Bundled resources — no async HTTP fetch, available on first render
    resources: {
      en: {
        common: enCommon,
        pet: enPet,
        actions: enActions,
        wellness: enWellness,
        errors: enErrors,
        notifications: enNotifications,
        legal: enLegal,
        journal: enJournal,
      },
      es: {
        common: esCommon,
        pet: esPet,
        actions: esActions,
        wellness: esWellness,
        errors: esErrors,
        notifications: esNotifications,
        legal: esLegal,
        journal: esJournal,
      },
    },
  });

export default i18n;
