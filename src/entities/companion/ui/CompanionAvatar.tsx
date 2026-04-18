// Companion avatar — selects renderer based on species family.
// 3D species (zephyr/kova/luma/maru): React Three Fiber canvas.
// 2D species (nimbus/boba/mochi/nuri): react-kawaii flat illustration.
// No store read — the species itself encodes the rendering mode.
// R3: no style={{}}. Size is controlled by Tailwind classes on the wrapper div.

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KAWAII_SPECIES } from '../model/constants';
import type { CompanionMood, CompanionSpecies, CompanionStage } from '../model/types';
import { getSpeciesStageConfig } from '../model/species';
import type { CompanionMeshProps } from './characters/ThreeCompanions';
import { ZephyrMesh, KovaMesh, LumaMesh, MaruMesh } from './characters/ThreeCompanions';
import { KawaiiAvatar } from './KawaiiAvatar';

type MeshComponent = (props: CompanionMeshProps) => React.JSX.Element;

const SPECIES_MESH: Partial<Record<CompanionSpecies, MeshComponent>> = {
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
  /** Increments on each user action — triggers companion bounce reaction (3D only) */
  reactionKey?: number;
}

// Maps numeric size to Tailwind dimension classes — no inline styles (R3).
function sizeToClass(size: number): string {
  if (size <= 80) return 'h-20 w-20';
  if (size <= 112) return 'h-28 w-28';
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
  // 2D kawaii species — render flat illustration
  if (KAWAII_SPECIES.has(species)) {
    return (
      <div className={sizeToClass(size)}>
        <KawaiiAvatar species={species} stage={stage} mood={mood} size={size} />
      </div>
    );
  }

  // 3D species — render R3F canvas
  const { color } = getSpeciesStageConfig(species, stage);
  // eslint-disable-next-line security/detect-object-injection
  const ThreeMesh = SPECIES_MESH[species];
  if (!ThreeMesh) return <div className={sizeToClass(size)} />;

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
