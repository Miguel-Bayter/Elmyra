// 2D kawaii companion using react-kawaii flat illustrations.
// Only renders for the 4 kawaii species: nimbus, boba, mochi, nuri.
// Mood → kawaii mood, stage → size scaling, species color → fill color.
// R3: size is a numeric prop accepted by react-kawaii, not a CSS inline style.

import React from 'react';
import { Cat, Ghost, IceCream, Planet } from 'react-kawaii';
import type { CompanionMood, CompanionSpecies, CompanionStage } from '../model/types';
import { getSpeciesStageConfig } from '../model/species';

// ── Mood mapping ──────────────────────────────────────────────────────────────
type KawaiiMood = 'sad' | 'happy' | 'blissful' | 'lovestruck' | 'excited';

const MOOD_MAP: Record<CompanionMood, KawaiiMood> = {
  radiant: 'blissful',
  calm: 'happy',
  restless: 'excited',
  weary: 'sad',
  fragile: 'sad',
  resting: 'lovestruck',
};

// ── Species → kawaii character ────────────────────────────────────────────────
// nimbus (dream wisp)   → Ghost
// boba   (cosmic orb)   → Planet
// mochi  (soft comfort) → IceCream
// nuri   (curious cat)  → Cat
type KawaiiComponent = typeof Ghost | typeof Planet | typeof IceCream | typeof Cat;

const SPECIES_KAWAII: Partial<Record<CompanionSpecies, KawaiiComponent>> = {
  nimbus: Ghost,
  boba: Planet,
  mochi: IceCream,
  nuri: Cat,
};

// ── Size: fixed at caller's request — stage variation handled by species color ─
const DEFAULT_KAWAII_SIZE = 120;

export interface KawaiiAvatarProps {
  species: CompanionSpecies;
  stage: CompanionStage;
  mood: CompanionMood;
  size?: number;
}

export function KawaiiAvatar({
  species,
  stage,
  mood,
  size,
}: KawaiiAvatarProps): React.JSX.Element | null {
  // eslint-disable-next-line security/detect-object-injection
  const KawaiiComponent = SPECIES_KAWAII[species];
  if (!KawaiiComponent) return null;

  const { color } = getSpeciesStageConfig(species, stage);
  // eslint-disable-next-line security/detect-object-injection
  const kawaiiMood = MOOD_MAP[mood];

  return <KawaiiComponent size={size ?? DEFAULT_KAWAII_SIZE} mood={kawaiiMood} color={color} />;
}
