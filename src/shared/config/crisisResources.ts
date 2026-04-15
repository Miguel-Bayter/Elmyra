// Crisis resources per country — sourced from verified organizations.
// IMPORTANT: Verify links and numbers before each production deploy. Update annually.
// Last verified: 2026-04-14

export interface CrisisResource {
  readonly name: string;
  readonly url: string;
  readonly phone: string;
  readonly isText?: boolean; // true when contact method is SMS/text, not voice call
}

export interface CountryEntry {
  readonly code: string; // ISO 3166-1 alpha-2
  readonly flag: string; // emoji flag
  readonly nameES: string; // display name in Spanish
  readonly nameEN: string; // display name in English
  readonly resources: readonly CrisisResource[];
}

export const CRISIS_COUNTRIES: readonly CountryEntry[] = [
  {
    code: 'MX',
    flag: '🇲🇽',
    nameES: 'México',
    nameEN: 'Mexico',
    resources: [
      {
        name: 'Línea de la Vida',
        url: 'https://www.gob.mx/salud/articulos/linea-de-la-vida-de-lunes-a-domingo',
        phone: '800 911 2000',
      },
      {
        name: 'SAPTEL',
        url: 'https://www.saptel.org.mx',
        phone: '55 5259-8121',
      },
    ],
  },
  {
    code: 'ES',
    flag: '🇪🇸',
    nameES: 'España',
    nameEN: 'Spain',
    resources: [
      {
        name: 'Teléfono de la Esperanza',
        url: 'https://www.telefonodelaesperanza.org',
        phone: '717 003 717',
      },
      {
        name: 'Centro de Crisis (Madrid)',
        url: 'https://www.casmadrid.org',
        phone: '91 459 00 50',
      },
    ],
  },
  {
    code: 'AR',
    flag: '🇦🇷',
    nameES: 'Argentina',
    nameEN: 'Argentina',
    resources: [
      {
        name: 'Centro de Asistencia al Suicida',
        url: 'https://www.asistenciaalsuicida.org.ar',
        phone: '135',
      },
    ],
  },
  {
    code: 'CO',
    flag: '🇨🇴',
    nameES: 'Colombia',
    nameEN: 'Colombia',
    resources: [
      {
        name: 'Línea 106 — Salud Mental',
        url: 'https://www.minsalud.gov.co',
        phone: '106',
      },
    ],
  },
  {
    code: 'CL',
    flag: '🇨🇱',
    nameES: 'Chile',
    nameEN: 'Chile',
    resources: [
      {
        name: 'Saludablemente',
        url: 'https://saludablemente.minsal.cl',
        phone: '600 360 7777',
      },
    ],
  },
  {
    code: 'PE',
    flag: '🇵🇪',
    nameES: 'Perú',
    nameEN: 'Peru',
    resources: [
      {
        name: 'Línea 113 — MINSA',
        url: 'https://www.minsa.gob.pe',
        phone: '113',
      },
    ],
  },
  {
    code: 'US',
    flag: '🇺🇸',
    nameES: 'Estados Unidos',
    nameEN: 'United States',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        url: 'https://988lifeline.org',
        phone: '988',
      },
      {
        name: 'Crisis Text Line',
        url: 'https://www.crisistextline.org',
        phone: 'Text HOME to 741741',
        isText: true,
      },
    ],
  },
  {
    code: 'GB',
    flag: '🇬🇧',
    nameES: 'Reino Unido',
    nameEN: 'United Kingdom',
    resources: [
      {
        name: 'Samaritans',
        url: 'https://www.samaritans.org',
        phone: '116 123',
      },
      {
        name: 'SHOUT Crisis Text Line',
        url: 'https://giveusashout.org',
        phone: 'Text SHOUT to 85258',
        isText: true,
      },
    ],
  },
  {
    code: 'CA',
    flag: '🇨🇦',
    nameES: 'Canadá',
    nameEN: 'Canada',
    resources: [
      {
        name: 'Talk Suicide Canada',
        url: 'https://talksuicide.ca',
        phone: '988',
      },
      {
        name: 'Crisis Services Canada',
        url: 'https://www.crisisservicescanada.ca',
        phone: '1-833-456-4566',
      },
    ],
  },
  {
    code: 'AU',
    flag: '🇦🇺',
    nameES: 'Australia',
    nameEN: 'Australia',
    resources: [
      {
        name: 'Lifeline Australia',
        url: 'https://www.lifeline.org.au',
        phone: '13 11 14',
      },
      {
        name: 'Beyond Blue',
        url: 'https://www.beyondblue.org.au',
        phone: '1300 22 4636',
      },
    ],
  },
];

// Default country code based on app language
export const defaultCountryForLang = (lang: string): string =>
  lang.startsWith('es') ? 'MX' : 'US';
