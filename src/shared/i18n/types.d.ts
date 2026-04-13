// TypeScript declarations for i18next typed keys — R2 mandatory
// A wrong key is a compile error, not a runtime undefined.
import type commonEn from '../../../public/locales/en/common.json';
import type petEn from '../../../public/locales/en/pet.json';
import type actionsEn from '../../../public/locales/en/actions.json';
import type wellnessEn from '../../../public/locales/en/wellness.json';
import type errorsEn from '../../../public/locales/en/errors.json';
import type notificationsEn from '../../../public/locales/en/notifications.json';
import type legalEn from '../../../public/locales/en/legal.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof commonEn;
      pet: typeof petEn;
      actions: typeof actionsEn;
      wellness: typeof wellnessEn;
      errors: typeof errorsEn;
      notifications: typeof notificationsEn;
      legal: typeof legalEn;
    };
  }
}
