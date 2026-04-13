// Crisis resources per locale — sourced from verified organizations
// IMPORTANT: Verify links are active before each production deploy. Update annually.

export interface CrisisResource {
  readonly name: string;
  readonly url: string;
  readonly phone: string;
  readonly description: string;
}

export const CRISIS_RESOURCES: Readonly<Record<string, readonly CrisisResource[]>> = {
  en: [
    {
      name: '988 Suicide & Crisis Lifeline',
      url: 'https://988lifeline.org',
      phone: '988',
      description: 'US — Call or text 988',
    },
    {
      name: 'Crisis Text Line',
      url: 'https://www.crisistextline.org',
      phone: 'Text HOME to 741741',
      description: 'US, UK, Canada, Ireland',
    },
  ],
  es: [
    {
      name: 'Línea de la Vida',
      url: 'https://www.gob.mx/salud/articulos/linea-de-la-vida-de-lunes-a-domingo',
      phone: '800 911 2000',
      description: 'México — 24/7 gratuito',
    },
    {
      name: 'Centro de Asistencia al Suicida',
      url: 'https://www.casmadrid.org',
      phone: '717 003 717',
      description: 'España — 24/7',
    },
  ],
};
