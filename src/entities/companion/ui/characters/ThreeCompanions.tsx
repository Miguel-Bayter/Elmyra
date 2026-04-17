// 3D therapeutic companions — four cute animals for emotional wellbeing.
// Built with React Three Fiber using Three.js primitive geometries.
//
// Silhouettes are deliberately distinct at thumbnail size:
//   Zephyr → Penguin: tall oval body + belly patch + side wings (vertical)
//   Kova   → Cat: round head + triangle ears + curved tail (cozy shape)
//   Luma   → Bear Cub: plump round form + snout + ear domes (soft sphere)
//   Maru   → Duck: large puffball body + flat beak + wing pads (round/wide)
//
// All use MeshToonMaterial + DataTexture gradient maps for anime cel shading.
// meshBasicMaterial for face features — unaffected by scene lighting.
//
// R3: Three.js JSX props are not React inline styles — no style={{}} used anywhere.

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CompanionMood, CompanionStage } from '../../model/types';

// ─── Toon gradient ────────────────────────────────────────────────────────────
function makeToonGradient(bands: number[]): THREE.DataTexture {
  const data = new Uint8Array(bands.length * 4);
  bands.forEach((v, i) => {
    const b = Math.round(Math.min(1, Math.max(0, v)) * 255);
    data[i * 4] = b;
    data[i * 4 + 1] = b;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  });
  const tex = new THREE.DataTexture(data, bands.length, 1);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

const TOON = makeToonGradient([0.38, 0.72, 1.0]);
const TOON_CRISP = makeToonGradient([0.32, 1.0]);

// ─── Shared types ─────────────────────────────────────────────────────────────
export interface CompanionMeshProps {
  stage: CompanionStage;
  mood: CompanionMood;
  color: string;
  /** Increments each time the user performs an action — triggers bounce reaction */
  reactionKey?: number;
}

interface AnimState {
  t: number;
  bouncing: boolean;
  bounceT: number;
}

// ─── Shared animation hook ────────────────────────────────────────────────────
export function useCompanionAnimation(
  mood: CompanionMood,
  reactionKey?: number,
): {
  groupRef: React.RefObject<THREE.Group | null>;
  handleClick: () => void;
} {
  const groupRef = useRef<THREE.Group | null>(null);
  const anim = useRef<AnimState>({ t: 0, bouncing: false, bounceT: 0 });
  const moodRef = useRef<CompanionMood>(mood);
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  moodRef.current = mood;

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g || prefersReduced.current) return;
    const a = anim.current;
    a.t += delta;
    const { t } = a;
    g.position.x = 0;
    g.rotation.z = 0;
    g.scale.setScalar(1);

    if (a.bouncing) {
      a.bounceT += delta;
      const decay = Math.max(0, 1 - a.bounceT * 2.2);
      g.position.y = Math.sin(a.bounceT * 14) * 0.2 * decay;
      if (a.bounceT > 0.5) {
        a.bouncing = false;
        a.bounceT = 0;
        g.position.y = 0;
      }
      return;
    }

    switch (moodRef.current) {
      case 'radiant':
        g.position.y = Math.sin(t * 1.8) * 0.11;
        g.scale.setScalar(1 + Math.sin(t * 1.8) * 0.02);
        break;
      case 'calm':
        g.position.y = Math.sin(t * 1.2) * 0.07;
        break;
      case 'restless':
        g.position.x = Math.sin(t * 5.5) * 0.055;
        g.position.y = Math.abs(Math.sin(t * 3)) * 0.025;
        break;
      case 'weary':
        g.scale.setScalar(1 + Math.sin(t * 0.8) * 0.016);
        g.rotation.z = Math.sin(t * 0.5) * 0.035;
        break;
      case 'fragile':
        g.position.y = Math.sin(t * 2.2) * 0.035;
        g.position.x = Math.sin(t * 3.4) * 0.018;
        break;
      case 'resting':
        g.scale.setScalar(1 + Math.sin(t * 0.9) * 0.025);
        break;
    }
  });

  // Trigger bounce when a care action is performed
  useEffect(() => {
    if (reactionKey !== undefined) {
      anim.current.bouncing = true;
      anim.current.bounceT = 0;
    }
  }, [reactionKey]);

  const handleClick = (): void => {
    anim.current.bouncing = true;
    anim.current.bounceT = 0;
  };
  return { groupRef, handleClick };
}

// ─── Shared face ──────────────────────────────────────────────────────────────
// Oval anime eyes: sclera → iris → pupil → dual shine. Natural blink.

interface FaceProps {
  ink?: string;
  irisColor?: string;
  mood: CompanionMood;
  eyeSpan?: number;
  eyeY?: number;
  zOffset?: number;
}

export function Face({
  ink = '#2d2520',
  irisColor = '#1a1a2e',
  mood,
  eyeSpan = 0.2,
  eyeY = 0.07,
  zOffset = 0.88,
}: FaceProps): React.JSX.Element {
  const leftEye = useRef<THREE.Group | null>(null);
  const rightEye = useRef<THREE.Group | null>(null);
  const moodRef = useRef<CompanionMood>(mood);
  const prefersReducedFace = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  moodRef.current = mood;

  useFrame(({ clock }) => {
    if (prefersReducedFace.current) return;
    const t = clock.elapsedTime;
    const blinkSignal = Math.max(0, Math.sin(t * 0.9) * Math.sin(t * 1.7) - 0.55);
    const blinkScaleY = Math.max(0.08, 1 - Math.min(1, blinkSignal * 3.2));
    const m = moodRef.current;
    const baseY = m === 'weary' || m === 'resting' ? 0.32 : 1;
    const finalY = Math.min(baseY, blinkScaleY);
    if (leftEye.current) leftEye.current.scale.y = finalY;
    if (rightEye.current) rightEye.current.scale.y = finalY;
  });

  const bigEyes = mood === 'restless';
  const eyeR = bigEyes ? 0.095 : 0.072;
  const isSad = mood === 'weary' || mood === 'fragile';
  const isNeutral = mood === 'resting';

  const renderEye = (): React.JSX.Element => (
    <>
      <mesh scale={[1, 1.4, 0.62]}>
        <sphereGeometry args={[eyeR, 14, 14]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, eyeR * 0.46]} scale={[1, 1.4, 0.62]}>
        <sphereGeometry args={[eyeR * 0.62, 12, 12]} />
        <meshBasicMaterial color={irisColor} />
      </mesh>
      <mesh position={[0, 0, eyeR * 0.72]}>
        <sphereGeometry args={[eyeR * 0.3, 8, 8]} />
        <meshBasicMaterial color={ink} />
      </mesh>
      <mesh position={[eyeR * 0.3, eyeR * 0.32, eyeR * 0.9]}>
        <sphereGeometry args={[eyeR * 0.22, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-eyeR * 0.16, -eyeR * 0.1, eyeR * 0.9]}>
        <sphereGeometry args={[eyeR * 0.1, 5, 5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );

  return (
    <>
      <group ref={leftEye} position={[-eyeSpan, eyeY, zOffset]}>
        {renderEye()}
      </group>
      <group ref={rightEye} position={[eyeSpan, eyeY, zOffset]}>
        {renderEye()}
      </group>

      {mood === 'radiant' && (
        <>
          <mesh position={[-eyeSpan * 1.8, eyeY - 0.1, zOffset - 0.05]}>
            <sphereGeometry args={[eyeR * 1.4, 10, 10]} />
            <meshBasicMaterial color="#ffb0a0" transparent opacity={0.3} />
          </mesh>
          <mesh position={[eyeSpan * 1.8, eyeY - 0.1, zOffset - 0.05]}>
            <sphereGeometry args={[eyeR * 1.4, 10, 10]} />
            <meshBasicMaterial color="#ffb0a0" transparent opacity={0.3} />
          </mesh>
        </>
      )}

      {isNeutral ? (
        <mesh position={[0, eyeY - 0.2, zOffset]}>
          <boxGeometry args={[eyeSpan * 0.88, 0.026, 0.02]} />
          <meshBasicMaterial color={ink} />
        </mesh>
      ) : (
        <mesh
          position={[0, isSad ? eyeY - 0.14 : eyeY - 0.2, zOffset]}
          rotation={[0, 0, isSad ? 0 : Math.PI]}
        >
          <torusGeometry args={[eyeSpan * 0.55, 0.02, 6, 14, Math.PI]} />
          <meshBasicMaterial color={ink} />
        </mesh>
      )}
    </>
  );
}

// ─── Zephyr → Penguin ─────────────────────────────────────────────────────────
// Ice-blue penguin with cream belly, flat capsule wings, orange beak + feet.
// Silhouette: TALL oval body with wide wing stubs (distinct vertical silhouette).
// Therapeutic: steady rhythmic waddle mirrors calm regulated breathing.
//
// Evolution arc:
//   Seedling  → small penguin, plain tummy patch
//   Sprout    → little bow tie appears
//   Bloom     → ice-crystal headband
//   Flourish  → golden shimmer crown + sparkles

export function ZephyrMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const CREAM = '#f0f4f8';
  const ORANGE = '#f08040';
  const GOLD = '#f0d878';
  const ICE = '#d8f0ff';

  const sparkles: [number, number, number][] = [
    [0.48, 0.88, 0.12],
    [-0.5, 0.82, 0.12],
    [0.26, 1.06, 0.08],
    [-0.24, 1.02, 0.08],
  ];

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Main body — tall oval */}
      <mesh scale={[0.78, 1.22, 0.85]}>
        <sphereGeometry args={[0.52, 26, 26]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Cream belly patch */}
      <mesh position={[0, -0.04, 0.36]} scale={[0.54, 0.78, 0.18]}>
        <sphereGeometry args={[0.52, 18, 18]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Face on head */}
      <Face
        irisColor="#1a2c6e"
        ink="#101828"
        mood={mood}
        eyeSpan={0.15}
        eyeY={0.76}
        zOffset={1.06}
      />

      {/* Orange beak */}
      <mesh position={[0, 0.68, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.18, 8]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>

      {/* Flat capsule wings — stubby, held out at sides */}
      <mesh position={[-0.58, 0.06, 0]} rotation={[0.2, 0, -0.55]} scale={[0.55, 1, 0.38]}>
        <capsuleGeometry args={[0.12, 0.28, 4, 10]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.58, 0.06, 0]} rotation={[0.2, 0, 0.55]} scale={[0.55, 1, 0.38]}>
        <capsuleGeometry args={[0.12, 0.28, 4, 10]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Orange feet */}
      <mesh position={[-0.14, -0.66, 0.08]} scale={[1.3, 0.44, 1.1]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>
      <mesh position={[0.14, -0.66, 0.08]} scale={[1.3, 0.44, 1.1]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>

      {/* Sprout+: little bow tie */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[-0.11, 0.38, 0.42]} rotation={[0, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={ICE} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.11, 0.38, 0.42]} rotation={[0, 0, -Math.PI / 4]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={ICE} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.38, 0.44]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={GOLD} />
          </mesh>
        </>
      )}

      {/* Bloom+: ice crystal headband */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, 1.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.034, 6, 28]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={ICE} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 1.06, 0.3]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshBasicMaterial color={ICE} />
          </mesh>
        </>
      )}

      {/* Flourish: golden crown + sparkles */}
      {stage === 'flourish' && (
        <>
          <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.044, 8, 32]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={GOLD} />
          </mesh>
          {sparkles.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={GOLD} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// ─── Kova → Cat ───────────────────────────────────────────────────────────────
// Warm tabby cat — round head with pointy triangle ears, plump capsule body,
// whiskers, soft cheek puffs, and a gently curved sphere-chain tail.
// Silhouette: COMPACT round + triangle ears + curled tail arc (cozy shape).
// Therapeutic: warm grounded presence, like a cat curled up beside you.
//
// Evolution arc:
//   Seedling → small cat, plain
//   Sprout   → ribbon collar with small charm
//   Bloom    → inner ear glow + second cheek blush
//   Flourish → flower crown on head

export function KovaMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const INNER_EAR = '#f0b0b0';
  const CREAM = '#f5e8d8';
  const CHARM = '#f0d060';
  const FLOWER = '#f0a0c0';

  const HEAD_Y = 0.36;

  // Tail arc — 5 descending spheres curling to the right and up
  const tailPuffs: [number, number, number, number][] = [
    [0.42, -0.48, -0.1, 0.14],
    [0.6, -0.32, -0.08, 0.12],
    [0.7, -0.12, -0.06, 0.11],
    [0.66, 0.1, -0.04, 0.09],
    [0.58, 0.28, -0.02, 0.08],
  ];

  // Whisker lines on left and right cheeks
  const whiskerL: [number, number, number, number, number][] = [
    [-0.48, HEAD_Y - 0.04, HEAD_Y + 0.26, 0, 0.18],
    [-0.5, HEAD_Y - 0.1, HEAD_Y + 0.26, 0, 0.12],
  ];
  const whiskerR: [number, number, number, number, number][] = whiskerL.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([x, y, z, _rx, rz]) => [-x, y, z, 0, -rz],
  );

  const flowerPetals: [number, number, number][] = Array.from(
    { length: 5 },
    (_, i): [number, number, number] => {
      const a = (i / 5) * Math.PI * 2;
      return [Math.cos(a) * 0.18, HEAD_Y + 0.52 + Math.sin(a) * 0.12, 0.32];
    },
  );

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Triangle ears — pointed, on top of head */}
      <mesh position={[-0.26, HEAD_Y + 0.38, 0.04]} rotation={[0, 0, 0.22]} scale={[1, 1.5, 0.6]}>
        <coneGeometry args={[0.14, 0.3, 4]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.26, HEAD_Y + 0.38, 0.04]} rotation={[0, 0, -0.22]} scale={[1, 1.5, 0.6]}>
        <coneGeometry args={[0.14, 0.3, 4]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      {/* Pink inner ear */}
      <mesh position={[-0.26, HEAD_Y + 0.38, 0.1]} rotation={[0, 0, 0.22]} scale={[0.6, 1.2, 0.2]}>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={INNER_EAR} />
      </mesh>
      <mesh position={[0.26, HEAD_Y + 0.38, 0.1]} rotation={[0, 0, -0.22]} scale={[0.6, 1.2, 0.2]}>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={INNER_EAR} />
      </mesh>

      {/* Round head */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.42, 26, 26]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Cheek puffs */}
      <mesh position={[-0.36, HEAD_Y - 0.08, 0.3]} scale={[0.9, 0.7, 0.6]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.36, HEAD_Y - 0.08, 0.3]} scale={[0.9, 0.7, 0.6]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} transparent opacity={0.6} />
      </mesh>

      <Face
        irisColor="#6a3820"
        ink="#2a1408"
        mood={mood}
        eyeSpan={0.19}
        eyeY={HEAD_Y + 0.06}
        zOffset={HEAD_Y + 0.42}
      />

      {/* Whiskers */}
      {[...whiskerL, ...whiskerR].map(([x, y, z, rx, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, 0, rz]}>
          <boxGeometry args={[0.22, 0.018, 0.012]} />
          <meshBasicMaterial color="#2d2520" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Plump body — slightly wide capsule */}
      <mesh position={[0, -0.22, 0]} scale={[1.08, 1.0, 0.96]}>
        <capsuleGeometry args={[0.26, 0.22, 6, 18]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Short arm nubs */}
      <mesh position={[-0.44, -0.12, 0.06]} scale={[0.72, 1.1, 0.72]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.44, -0.12, 0.06]} scale={[0.72, 1.1, 0.72]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Tiny feet */}
      <mesh position={[-0.14, -0.56, 0.06]} scale={[1.2, 0.6, 1.1]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.14, -0.56, 0.06]} scale={[1.2, 0.6, 1.1]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Tail — sphere chain curling to the right */}
      {tailPuffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshToonMaterial gradientMap={TOON} color={color} />
        </mesh>
      ))}
      {/* Fluffy tail tip */}
      <mesh position={[0.52, 0.36, -0.02]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} />
      </mesh>

      {/* Sprout+: ribbon collar */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.04, 6, 28]} />
            <meshToonMaterial
              gradientMap={TOON_CRISP}
              color={INNER_EAR}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0, 0.08, 0.34]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={CHARM} />
          </mesh>
        </>
      )}

      {/* Bloom+: cheek blush deepens + inner ear glow */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[-0.36, HEAD_Y - 0.08, 0.34]} scale={[0.7, 0.55, 0.3]}>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshBasicMaterial color={INNER_EAR} transparent opacity={0.45} />
          </mesh>
          <mesh position={[0.36, HEAD_Y - 0.08, 0.34]} scale={[0.7, 0.55, 0.3]}>
            <sphereGeometry args={[0.18, 10, 10]} />
            <meshBasicMaterial color={INNER_EAR} transparent opacity={0.45} />
          </mesh>
        </>
      )}

      {/* Flourish: flower crown */}
      {stage === 'flourish' && (
        <>
          {flowerPetals.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshBasicMaterial color={FLOWER} />
            </mesh>
          ))}
          <mesh position={[0, HEAD_Y + 0.52, 0.32]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={CHARM} />
          </mesh>
        </>
      )}
    </group>
  );
}

// ─── Luma → Bear Cub ──────────────────────────────────────────────────────────
// Golden bear cub — plump round body, dome ear bumps, protruding round snout,
// cream tummy patch, and stubby little paws. Warm amber-honey palette.
// Silhouette: PLUMP round + small ear domes + snout bump (soft warm shape).
// Therapeutic: huggable warmth represents hope kindling through consistent care.
//
// Evolution arc:
//   Seedling → plain cub, cream tummy
//   Sprout   → honey drop charm on tummy
//   Bloom    → little flower behind ear
//   Flourish → golden halo + honey-glow

export function LumaMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const CREAM = '#f8ead8';
  const HONEY = '#f0a830';
  const PINK = '#f0b0b0';
  const GOLD = '#f8e060';

  const HEAD_Y = 0.42;

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Dome ear bumps — small round spheres sitting on top of head */}
      <mesh position={[-0.3, HEAD_Y + 0.36, 0.04]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.3, HEAD_Y + 0.36, 0.04]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      {/* Inner ear dots */}
      <mesh position={[-0.3, HEAD_Y + 0.36, 0.18]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={PINK} />
      </mesh>
      <mesh position={[0.3, HEAD_Y + 0.36, 0.18]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={PINK} />
      </mesh>

      {/* Round head */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.44, 26, 26]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Round protruding snout */}
      <mesh position={[0, HEAD_Y - 0.1, 0.36]} scale={[1.1, 0.8, 0.62]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} />
      </mesh>
      {/* Tiny nose */}
      <mesh position={[0, HEAD_Y - 0.04, 0.54]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#5a2010" />
      </mesh>

      <Face
        irisColor="#6a3800"
        ink="#2a1400"
        mood={mood}
        eyeSpan={0.18}
        eyeY={HEAD_Y + 0.1}
        zOffset={HEAD_Y + 0.42}
      />

      {/* Plump round body */}
      <mesh position={[0, -0.16, 0]} scale={[1.06, 1.0, 0.98]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Cream tummy patch */}
      <mesh position={[0, -0.14, 0.36]} scale={[0.62, 0.72, 0.2]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} />
      </mesh>

      {/* Stubby arm paws */}
      <mesh position={[-0.52, -0.08, 0.1]} scale={[0.78, 1.1, 0.78]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.52, -0.08, 0.1]} scale={[0.78, 1.1, 0.78]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      {/* Paw pads */}
      <mesh position={[-0.56, -0.12, 0.22]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={CREAM} />
      </mesh>
      <mesh position={[0.56, -0.12, 0.22]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={CREAM} />
      </mesh>

      {/* Round feet */}
      <mesh position={[-0.16, -0.54, 0.1]} scale={[1.3, 0.62, 1.2]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.16, -0.54, 0.1]} scale={[1.3, 0.62, 1.2]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Sprout+: honey drop on tummy */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, -0.06, 0.54]} scale={[1, 1.4, 1]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshBasicMaterial color={HONEY} />
          </mesh>
          <mesh position={[0, -0.2, 0.53]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.06, 0.12, 8]} />
            <meshBasicMaterial color={HONEY} />
          </mesh>
        </>
      )}

      {/* Bloom+: flower behind ear */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[-0.44, HEAD_Y + 0.44, 0.1]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={PINK} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[-0.44 + Math.cos(a) * 0.1, HEAD_Y + 0.44 + Math.sin(a) * 0.1, 0.06]}
              >
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial color={PINK} transparent opacity={0.85} />
              </mesh>
            );
          })}
        </>
      )}

      {/* Flourish: golden halo */}
      {stage === 'flourish' && (
        <>
          <mesh position={[0, HEAD_Y + 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.044, 8, 32]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={GOLD} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.54, 16, 16]} />
            <meshToonMaterial
              gradientMap={TOON}
              color={color}
              emissive={color}
              emissiveIntensity={0.18}
              transparent
              opacity={0.12}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// ─── Maru → Duck ──────────────────────────────────────────────────────────────
// Lavender duck — large puffball body, small round head, wide flat orange beak,
// little oval wing pads, orange feet, small tail feather bump behind.
// Silhouette: VERY ROUND body + distinct flat beak + oval wing pads (pudgy).
// Therapeutic: gentle acceptance of natural rhythms — serene and unhurried.
//
// Evolution arc:
//   Seedling → plain duck
//   Sprout   → little daisy on head
//   Bloom    → spinning bubble ring
//   Flourish → second ring + sparkle crown

export function MaruMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const ORANGE = '#f08030';
  const CREAM = '#f8f0e8';
  const DAISY = '#f8f0a0';
  const PINK = '#f0b8d8';

  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useFrame((_, delta) => {
    if (prefersReduced.current) return;
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.2;
  });

  const HEAD_Y = 0.58;

  const sparkles: [number, number, number][] = [
    [0.44, HEAD_Y + 0.52, 0.1],
    [-0.46, HEAD_Y + 0.48, 0.1],
    [0.22, HEAD_Y + 0.68, 0.06],
    [-0.2, HEAD_Y + 0.66, 0.06],
  ];

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Large puffball body — very round, the widest shape */}
      <mesh position={[0, -0.06, 0]} scale={[1.08, 1.0, 0.98]}>
        <sphereGeometry args={[0.52, 28, 28]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Small oval wing pads — flat, laid against body */}
      <mesh position={[-0.58, 0.04, 0.14]} scale={[0.62, 1.0, 0.36]} rotation={[0, 0.3, 0.4]}>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.58, 0.04, 0.14]} scale={[0.62, 1.0, 0.36]} rotation={[0, -0.3, -0.4]}>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Tail feather bump — small rounded nub at back */}
      <mesh position={[0, 0.14, -0.46]} scale={[0.7, 0.8, 0.6]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Small round head */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      <Face
        irisColor="#4050b8"
        ink="#181830"
        mood={mood}
        eyeSpan={0.16}
        eyeY={HEAD_Y + 0.06}
        zOffset={HEAD_Y + 0.36}
      />

      {/* Wide flat orange beak */}
      <mesh
        position={[0, HEAD_Y - 0.04, 0.3]}
        rotation={[Math.PI / 2.2, 0, 0]}
        scale={[1.4, 1, 0.6]}
      >
        <coneGeometry args={[0.1, 0.22, 8]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>

      {/* Orange feet — wide oval pads */}
      <mesh position={[-0.16, -0.54, 0.12]} scale={[1.5, 0.5, 1.3]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>
      <mesh position={[0.16, -0.54, 0.12]} scale={[1.5, 0.5, 1.3]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>

      {/* Sprout+: little daisy on head */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.13, HEAD_Y + 0.32 + Math.sin(a) * 0.06, 0.3]}
              >
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial color={CREAM} />
              </mesh>
            );
          })}
          <mesh position={[0, HEAD_Y + 0.32, 0.34]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color={DAISY} />
          </mesh>
        </>
      )}

      {/* Bloom+: spinning bubble ring */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.06, 0.046, 8, 40]} />
          <meshToonMaterial gradientMap={TOON_CRISP} color={color} transparent opacity={0.75} />
        </mesh>
      )}

      {/* Flourish: second ring + sparkle crown */}
      {stage === 'flourish' && (
        <>
          <mesh ref={ring2Ref} rotation={[Math.PI / 2 + 0.6, 0.4, 0]}>
            <torusGeometry args={[0.94, 0.038, 8, 40]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={PINK} transparent opacity={0.62} />
          </mesh>
          {sparkles.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={DAISY} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
