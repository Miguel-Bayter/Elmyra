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
  | 'SpeechBubble'
  | 'File'
  | 'Folder'
  | 'Backpack'
  | 'CreditCard';

export interface SpeciesStageConfig {
  readonly character: KawaiiCharacter;
  readonly color: string; // hex — matches design palette
}

export interface SpeciesConfig {
  readonly stages: Record<CompanionStage, SpeciesStageConfig>;
}

// ─── Felis ────────────────────────────────────────────────────────────────────
// The Bold Adventurer — a curious creature that grows into a digital legend.
// Arc: wild nature → fused technology. Palette: soft petal → rich violet.
const felis: SpeciesConfig = {
  stages: {
    seedling: { character: 'Cat', color: '#d4b8f0' }, // soft petal lavender
    sprout: { character: 'HumanCat', color: '#b090d8' }, // confident lavender
    bloom: { character: 'HumanDinosaur', color: '#8858b8' }, // bold deep purple
    flourish: { character: 'Cyborg', color: '#6030a0' }, // legendary violet
  },
};

// ─── Spectra ──────────────────────────────────────────────────────────────────
// The Cosmic Wanderer — a ghost of starlight that expands into a digital cosmos.
// Arc: ethereal spirit → explorer → world → infinite. Palette: ice → deep space.
const spectra: SpeciesConfig = {
  stages: {
    seedling: { character: 'Ghost', color: '#c8e8f8' }, // pale ethereal ice
    sprout: { character: 'Astronaut', color: '#88b4e0' }, // sky blue explorer
    bloom: { character: 'Planet', color: '#4878c0' }, // vast cosmic blue
    flourish: { character: 'Browser', color: '#1848a0' }, // infinite deep space
  },
};

// ─── Dolcis ───────────────────────────────────────────────────────────────────
// The Warm Soul — a sweet treat that discovers its voice through care and warmth.
// Arc: sweetness → comfort → nourishment → expression. Palette: vanilla → mahogany.
const dolcis: SpeciesConfig = {
  stages: {
    seedling: { character: 'IceCream', color: '#ffe4b8' }, // vanilla cream
    sprout: { character: 'Chocolate', color: '#f0c080' }, // warm caramel
    bloom: { character: 'Mug', color: '#d89050' }, // coffee warmth
    flourish: { character: 'SpeechBubble', color: '#b86830' }, // mahogany voice
  },
};

// ─── Lumis ────────────────────────────────────────────────────────────────────
// The Story Keeper — a blank page that fills with experience and becomes a relic.
// Arc: blank note → growing archive → ready to explore → timeless artifact.
// Palette: fresh parchment → weathered gold → ancient bronze.
const lumis: SpeciesConfig = {
  stages: {
    seedling: { character: 'File', color: '#f8e8a8' }, // fresh parchment
    sprout: { character: 'Folder', color: '#e8c840' }, // golden pages
    bloom: { character: 'Backpack', color: '#c89820' }, // weathered amber
    flourish: { character: 'CreditCard', color: '#a06808' }, // rare bronze
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────
export const SPECIES_CONFIG: Record<CompanionSpecies, SpeciesConfig> = {
  felis,
  spectra,
  dolcis,
  lumis,
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
