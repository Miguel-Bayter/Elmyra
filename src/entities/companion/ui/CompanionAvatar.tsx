// 3D companion renderer — wraps each species mesh in an R3F Canvas.
// The Canvas fills its parent container; size the parent div to control display size.
// Transparency (alpha: true) lets the ambient glow ring in PetDisplay show through.

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { CompanionMood, CompanionSpecies, CompanionStage } from '../model/types';
import { getSpeciesStageConfig } from '../model/species';
import type { CompanionMeshProps } from './characters/ThreeCompanions';
import { ZephyrMesh, KovaMesh, LumaMesh, MaruMesh } from './characters/ThreeCompanions';

type MeshComponent = (props: CompanionMeshProps) => React.JSX.Element;

const SPECIES_MESH: Record<CompanionSpecies, MeshComponent> = {
  zephyr: ZephyrMesh,
  kova: KovaMesh,
  luma: LumaMesh,
  maru: MaruMesh,
};

export interface CompanionAvatarProps {
  species: CompanionSpecies;
  stage: CompanionStage;
  mood: CompanionMood;
  size?: number;
  /** Increments on each user action — triggers companion bounce reaction */
  reactionKey?: number;
}

// Maps numeric size to Tailwind dimension classes — no inline styles (R3).
function sizeToClass(size: number): string {
  if (size <= 80) return 'h-20 w-20';
  if (size <= 120) return 'h-[120px] w-[120px]';
  return 'h-40 w-40';
}

export function CompanionAvatar({
  species,
  stage,
  mood,
  size = 160,
  reactionKey,
}: CompanionAvatarProps): React.JSX.Element {
  const { color } = getSpeciesStageConfig(species, stage);
  // Safe: species is a typed union value, never user-supplied input
  // eslint-disable-next-line security/detect-object-injection
  const ThreeMesh = SPECIES_MESH[species];

  return (
    <div className={sizeToClass(size)}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[2, 3, 3]} intensity={1.1} />
        <pointLight position={[-2, -1, 2]} intensity={0.35} color="#e8dff5" />
        <Suspense fallback={null}>
          <ThreeMesh
            stage={stage}
            mood={mood}
            color={color}
            {...(reactionKey !== undefined && { reactionKey })}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
