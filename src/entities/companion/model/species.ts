// Species configuration — pure data, no UI/React imports.
// Defines the visual evolution line for each companion species.
// Widget layer (CompanionAvatar) maps these to actual kawaii components.

import type { CompanionSpecies, CompanionStage } from './types';

// Kawaii component names exported by react-kawaii (string identifiers only here)
export type KawaiiCharacter =
  | 'Cat'
  | 'HumanCat'
  | 'HumanDinosaur'
  | 'Cyborg'
  | 'Ghost'
  | 'Planet'
  | 'Astronaut'
  | 'Browser'
  | 'IceCream'
  | 'Chocolate'
  | 'Mug'
  | 'SpeechBubble';

export interface SpeciesStageConfig {
  readonly character: KawaiiCharacter;
  readonly color: string; // hex — matches design palette
}

export interface SpeciesConfig {
  readonly stages: Record<CompanionStage, SpeciesStageConfig>;
}

// ─── Felis ────────────────────────────────────────────────────────────────────
// Adventurous creature. Nature → technology arc.
// Palette: lavender — brand identity color, curious and bold.
const felis: SpeciesConfig = {
  stages: {
    seedling: { character: 'Cat', color: '#b8a3d8' },
    sprout: { character: 'HumanCat', color: '#c8b8e8' },
    bloom: { character: 'HumanDinosaur', color: '#9b85cc' },
    flourish: { character: 'Cyborg', color: '#7a60b8' },
  },
};

// ─── Spectra ──────────────────────────────────────────────────────────────────
// Cosmic spirit. Spirit → cosmos → knowledge arc.
// Palette: mint — calm, infinite, serene.
const spectra: SpeciesConfig = {
  stages: {
    seedling: { character: 'Ghost', color: '#a8d8c8' },
    sprout: { character: 'Planet', color: '#88c8b4' },
    bloom: { character: 'Astronaut', color: '#68b898' },
    flourish: { character: 'Browser', color: '#4ea884' },
  },
};

// ─── Dolcis ───────────────────────────────────────────────────────────────────
// Warm comfort. Sweetness → nourishment → expression arc.
// Palette: peach — warm, cozy, welcoming.
const dolcis: SpeciesConfig = {
  stages: {
    seedling: { character: 'IceCream', color: '#f5c8a0' },
    sprout: { character: 'Chocolate', color: '#e8b080' },
    bloom: { character: 'Mug', color: '#d89868' },
    flourish: { character: 'SpeechBubble', color: '#c88050' },
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────
export const SPECIES_CONFIG: Record<CompanionSpecies, SpeciesConfig> = {
  felis,
  spectra,
  dolcis,
};

/** Returns the kawaii character and color for a given species + stage. */
export const getSpeciesStageConfig = (
  species: CompanionSpecies,
  stage: CompanionStage,
): SpeciesStageConfig => {
  // Safe: species and stage are typed union values, never user-supplied strings
  // eslint-disable-next-line security/detect-object-injection
  return SPECIES_CONFIG[species].stages[stage];
};
