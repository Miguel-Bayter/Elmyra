// Species configuration — pure data, no UI/React imports.
// Defines the color palette per stage for each companion species.
// The character layer (ThreeCompanions.tsx) maps these to 3D mesh components.

import type { CompanionSpecies, CompanionStage } from './types';

export interface SpeciesStageConfig {
  readonly color: string; // hex — used by the 3D mesh as its primary material color
}

export interface SpeciesConfig {
  readonly stages: Record<CompanionStage, SpeciesStageConfig>;
}

// ─── Zephyr ───────────────────────────────────────────────────────────────────
// Cloud/breath spirit — pale mist to open sky.
// Each shade is lighter than a storm, never alarming.
const zephyr: SpeciesConfig = {
  stages: {
    seedling: { color: '#eef2f7' }, // pale morning mist
    sprout: { color: '#c8ddf0' }, // soft sky blue
    bloom: { color: '#a0bcd8' }, // open sky
    flourish: { color: '#d8eaf6' }, // clear horizon silver
  },
};

// ─── Kova ─────────────────────────────────────────────────────────────────────
// Stone/earth spirit — warm stone to ancient bronze.
// Grounding palette: neutral, stable, never stimulating.
const kova: SpeciesConfig = {
  stages: {
    seedling: { color: '#d8cec6' }, // warm pebble
    sprout: { color: '#bcada0' }, // river stone
    bloom: { color: '#9e8e80' }, // deep stone
    flourish: { color: '#786858' }, // ancient bronze earth
  },
};

// ─── Luma ─────────────────────────────────────────────────────────────────────
// Glow/light spirit — dim amber to pale aurora gold.
// The light grows with care — represents hope rekindling.
const luma: SpeciesConfig = {
  stages: {
    seedling: { color: '#f4d090' }, // dim warm amber
    sprout: { color: '#f0c050' }, // warm golden glow
    bloom: { color: '#f8e060' }, // bright lantern gold
    flourish: { color: '#fff8c0' }, // pale aurora shimmer
  },
};

// ─── Maru ─────────────────────────────────────────────────────────────────────
// Ring/moon spirit — lavender pearl to deep violet cosmos.
// Softly saturated — calming without being cold.
const maru: SpeciesConfig = {
  stages: {
    seedling: { color: '#e8d8f0' }, // pale pearl lavender
    sprout: { color: '#d0b8e8' }, // soft crescent purple
    bloom: { color: '#b898d8' }, // full halo lavender
    flourish: { color: '#9878c0' }, // deep violet cosmos
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────
export const SPECIES_CONFIG: Record<CompanionSpecies, SpeciesConfig> = {
  zephyr,
  kova,
  luma,
  maru,
};

/** Returns the color config for a given species + stage. */
export const getSpeciesStageConfig = (
  species: CompanionSpecies,
  stage: CompanionStage,
): SpeciesStageConfig => {
  // Safe: species and stage are typed union values, never user-supplied strings
  // eslint-disable-next-line security/detect-object-injection
  return SPECIES_CONFIG[species].stages[stage];
};
