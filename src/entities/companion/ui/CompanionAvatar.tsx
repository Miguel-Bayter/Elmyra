// react-kawaii companions — driven by species + stage config from entity model.
// SPECIES_CONFIG maps each (species, stage) pair to a character + palette color.
// Adding a new species only requires updating species.ts — no changes here.

import React from 'react';
import {
  Cat,
  HumanCat,
  HumanDinosaur,
  Cyborg,
  Ghost,
  Planet,
  Astronaut,
  Browser,
  IceCream,
  Chocolate,
  Mug,
  SpeechBubble,
  File,
  Folder,
  Backpack,
  CreditCard,
} from 'react-kawaii';
import type { ComponentType } from 'react';
import type { CompanionMood, CompanionSpecies, CompanionStage } from '../model/types';
import { getSpeciesStageConfig } from '../model/species';

// react-kawaii mood type (not exported from the package — defined inline)
type KawaiiMood = 'sad' | 'shocked' | 'happy' | 'blissful' | 'lovestruck';

interface KawaiiProps {
  size: number;
  mood: KawaiiMood;
  color: string;
}

// Companion mood → kawaii mood mapping
const MOOD_MAP: Record<CompanionMood, KawaiiMood> = {
  radiant: 'blissful',
  calm: 'happy',
  restless: 'shocked',
  weary: 'sad',
  fragile: 'sad',
  resting: 'lovestruck',
};

// Character name → kawaii component (all react-kawaii chars used by any species)
const KAWAII_COMPONENTS: Record<string, ComponentType<KawaiiProps>> = {
  Cat,
  HumanCat,
  HumanDinosaur,
  Cyborg,
  Ghost,
  Planet,
  Astronaut,
  Browser,
  IceCream,
  Chocolate,
  Mug,
  SpeechBubble,
  File,
  Folder,
  Backpack,
  CreditCard,
};

export interface CompanionAvatarProps {
  species: CompanionSpecies;
  stage: CompanionStage;
  mood: CompanionMood;
  size?: number;
}

export function CompanionAvatar({
  species,
  stage,
  mood,
  size = 160,
}: CompanionAvatarProps): React.JSX.Element {
  const { character, color } = getSpeciesStageConfig(species, stage);
  // Safe: MOOD_MAP keys are the full CompanionMood union — not user input
  // eslint-disable-next-line security/detect-object-injection
  const kawaiiMood = MOOD_MAP[mood];
  // Safe: character values come from KawaiiCharacter union defined in species.ts
  // eslint-disable-next-line security/detect-object-injection
  const KawaiiComponent = KAWAII_COMPONENTS[character];

  if (!KawaiiComponent) {
    // Fallback: only reachable if species.ts and KAWAII_COMPONENTS fall out of sync
    return <Cat size={size} mood="happy" color={color} />;
  }

  return <KawaiiComponent size={size} mood={kawaiiMood} color={color} />;
}
