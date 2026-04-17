// 3D therapeutic companions — four mythological creatures for emotional wellbeing.
// Built with React Three Fiber using Three.js primitive geometries.
//
// Silhouettes are deliberately distinct at thumbnail size:
//   Zephyr → tall ghost teardrop (vertical)
//   Kova   → wide squat toad (horizontal)
//   Luma   → round sphere + dramatic flame crown
//   Maru   → round bunny with long drooping floppy ears
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

// ─── Zephyr ───────────────────────────────────────────────────────────────────
// Cloud Ghost — tall teardrop body, two round cloud-bump antennae on top.
// No legs — floats. Ghost-tail clusters drift at the base.
// Silhouette: TALL vertical elongated teardrop (distinct from all others).
// Therapeutic: the 4s breathing pulse mirrors mindfulness breath work.
//
// Evolution arc:
//   Bruma    → bare ghost body, tiny antenna bumps
//   Brisa    → wind swirl rings appear
//   Cúmulo   → gossamer wing-puff clusters
//   Horizonte → golden halo ring + sparkle dots

export function ZephyrMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const GOLD = '#f0d878';

  const breathRef = useRef<THREE.Group | null>(null);
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useFrame(({ clock }) => {
    if (!breathRef.current || prefersReduced.current) return;
    const s = 1 + 0.03 * Math.sin(clock.elapsedTime * (Math.PI / 2));
    breathRef.current.scale.setScalar(s);
  });

  // Ghost tail — 4 spheres descending, getting smaller and more transparent
  const tailGhosts: [number, number, number, number, number][] = [
    [0, -0.68, 0, 0.22, 0.72],
    [0.16, -0.82, 0, 0.16, 0.55],
    [-0.12, -0.92, 0, 0.12, 0.38],
    [0.06, -1.02, 0, 0.09, 0.22],
  ];

  // Wing puff clusters for bloom+
  const leftPuffs: [number, number, number][] = [
    [-0.72, 0.1, 0],
    [-0.88, 0.26, 0],
    [-0.8, -0.06, 0],
  ];
  const rightPuffs: [number, number, number][] = leftPuffs.map(([x, y, z]) => [-x, y, z]);

  const sparkles: [number, number, number][] = [
    [0.52, 0.9, 0.14],
    [-0.54, 0.84, 0.14],
    [0.28, 1.08, 0.08],
    [-0.26, 1.04, 0.08],
  ];

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Cloud-bump antennae — two soft round bumps on top, NOT bunny ears */}
      <mesh position={[-0.28, 0.98, 0.08]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.28, 0.98, 0.08]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      {/* Tiny inner glow on bumps */}
      <mesh position={[-0.28, 0.98, 0.2]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.28, 0.98, 0.2]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.35} />
      </mesh>

      {/* Main body — TALL teardrop, not round like others */}
      <group ref={breathRef}>
        <mesh scale={[0.88, 1.52, 0.9]}>
          <sphereGeometry args={[0.54, 26, 26]} />
          <meshToonMaterial gradientMap={TOON} color={color} />
        </mesh>
        <Face
          irisColor="#4a28a8"
          ink="#2a1840"
          mood={mood}
          eyeSpan={0.18}
          eyeY={0.24}
          zOffset={0.48}
        />
      </group>

      {/* Ghost tail clusters */}
      {tailGhosts.map(([x, y, z, r, op], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshToonMaterial gradientMap={TOON} color={color} transparent opacity={op} />
        </mesh>
      ))}

      {/* Sprout+: wind swirl rings */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2.4, 0.3, 0]}>
            <torusGeometry args={[0.72, 0.038, 6, 32, Math.PI * 1.6]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={GOLD} transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2.2, -0.4, 0.5]}>
            <torusGeometry args={[0.6, 0.028, 6, 28, Math.PI * 1.4]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={GOLD} transparent opacity={0.38} />
          </mesh>
        </>
      )}

      {/* Bloom+: gossamer wing-puff clusters */}
      {(stage === 'bloom' || stage === 'flourish') &&
        [...leftPuffs, ...rightPuffs].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1.0, 0.62, 0.44]}>
            <sphereGeometry args={[0.24, 12, 12]} />
            <meshToonMaterial gradientMap={TOON} color={color} transparent opacity={0.44} />
          </mesh>
        ))}

      {/* Flourish: golden halo + sparkles */}
      {stage === 'flourish' && (
        <>
          <mesh position={[0, 1.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.046, 8, 36]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={GOLD} />
          </mesh>
          {sparkles.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.052, 8, 8]} />
              <meshBasicMaterial color={GOLD} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// ─── Kova ─────────────────────────────────────────────────────────────────────
// Stone Toad — extremely wide and squat, completely different from Zephyr/Maru.
// NO ears at all. Two short round horn stubs on top. Heavy eyebrow ridge.
// Silhouette: WIDE horizontal oval — unmistakably different from all others.
// Therapeutic: the stable immovable form is a visual anchor for grounding.
//
// Evolution arc:
//   Guijarro → wide stone toad, horn stubs, heavy brow
//   Roca     → crystal spikes on shoulders
//   Monolito → chest armor plate + glowing rune
//   Antiguo  → rune glow + moss patches

export function KovaMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const CRYSTAL = '#a8d8d0';
  const MOSS = '#7aaa62';
  const RUNE = '#d4c880';

  // Head: very wide, slightly flat
  const HEAD_Y = 0.34;

  const crystalSpikes: [number, number, number, number][] = [
    [-0.6, -0.12, 0.08, 0.42],
    [0.6, -0.12, 0.08, -0.42],
    [-0.48, -0.02, 0.06, 0.24],
    [0.48, -0.02, 0.06, -0.24],
  ];

  const mossPatches: [number, number, number][] = [
    [-0.26, HEAD_Y + 0.26, 0.3],
    [0.22, HEAD_Y + 0.24, 0.32],
    [0.0, HEAD_Y + 0.3, 0.24],
  ];

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Head — wide, flat squash (1.30 × 0.82) */}
      <mesh position={[0, HEAD_Y, 0]} scale={[1.3, 0.82, 0.98]}>
        <sphereGeometry args={[0.42, 26, 26]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Horn stubs — two short round nubs, NOT tall ears */}
      <mesh position={[-0.28, HEAD_Y + 0.3, 0.08]} scale={[1, 2.0, 1]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={color} />
      </mesh>
      <mesh position={[0.28, HEAD_Y + 0.3, 0.08]} scale={[1, 2.0, 1]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={color} />
      </mesh>

      {/* Eyebrow ridge — thick stone brow */}
      <mesh position={[0, HEAD_Y + 0.1, HEAD_Y * 1.15]}>
        <boxGeometry args={[0.58, 0.055, 0.07]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={color} />
      </mesh>

      {/* Body — much wider than tall (1.55 × 0.70) */}
      <mesh position={[0, -0.22, 0]} scale={[1.55, 0.7, 0.96]}>
        <sphereGeometry args={[0.34, 22, 22]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Arms — very wide stubby nubs */}
      <mesh position={[-0.72, -0.18, 0]} scale={[0.8, 1.2, 0.8]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.72, -0.18, 0]} scale={[0.8, 1.2, 0.8]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Tiny feet — barely visible under body */}
      <mesh position={[-0.2, -0.5, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.2, -0.5, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      <Face
        irisColor="#3a6a4a"
        ink="#182018"
        mood={mood}
        eyeSpan={0.22}
        eyeY={HEAD_Y + 0.02}
        zOffset={HEAD_Y + 0.4}
      />

      {/* Sprout+: crystal spikes on shoulders */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') &&
        crystalSpikes.map(([x, y, z, rz], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, rz]} scale={[1, 1.9, 1]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={CRYSTAL} transparent opacity={0.8} />
          </mesh>
        ))}

      {/* Bloom+: chest armor plate + rune line */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, -0.14, 0.3]} scale={[1, 1, 0.16]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={RUNE} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, -0.14, 0.32]}>
            <boxGeometry args={[0.32, 0.032, 0.01]} />
            <meshBasicMaterial color={RUNE} transparent opacity={0.58} />
          </mesh>
        </>
      )}

      {/* Flourish: glowing rune + moss */}
      {stage === 'flourish' && (
        <>
          <mesh position={[0, -0.14, 0.34]}>
            <boxGeometry args={[0.24, 0.032, 0.01]} />
            <meshBasicMaterial color={RUNE} />
          </mesh>
          {mossPatches.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshToonMaterial gradientMap={TOON} color={MOSS} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// ─── Luma ─────────────────────────────────────────────────────────────────────
// Ember Wisp — perfectly round orb with a dramatic 5-cone flame crown.
// Body tapers into a trailing fire tail. No legs — floats.
// Silhouette: ROUND sphere + spiky crown on top (unmistakable shape).
// Therapeutic: luminosity grows through consistent care — hope made visible.
//
// Evolution arc:
//   Ember   → round orb, animated 5-flame crown, trailing fire
//   Fulgor  → orbital spark ring
//   Farol   → lantern cage struts
//   Aurora  → 8-ray corona

export function LumaMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const FLAME_A = '#ff8028';
  const FLAME_B = '#ffe060';

  const flames = useRef<(THREE.Mesh | null)[]>([null, null, null, null, null]);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useFrame(({ clock }) => {
    if (prefersReduced.current) return;
    const t = clock.elapsedTime;
    const offsets = [0, 1.1, 2.2, 0.6, 1.8];
    // Safe: i is bounded by flamePositions.length (5); offsets is a 5-element literal array
    flames.current.forEach((f, i) => {
      // eslint-disable-next-line security/detect-object-injection
      const off = offsets[i] ?? 0;
      if (f) f.scale.y = 0.78 + 0.38 * Math.abs(Math.sin(t * 4.0 + off));
    });
    if (ringRef.current) ringRef.current.rotation.y += 0.008;
  });

  // 5-cone flame crown: 1 center tall + 4 around
  const flamePositions: [number, number, number, number, number, number][] = [
    [0, 0.52 + 0.42, 0.06, 0, 0, 0],
    [0.22, 0.52 + 0.32, 0.04, 0, 0, 0.32],
    [-0.22, 0.52 + 0.32, 0.04, 0, 0, -0.32],
    [0.12, 0.52 + 0.26, 0.04, 0, 0, 0.14],
    [-0.12, 0.52 + 0.26, 0.04, 0, 0, -0.14],
  ];
  const flameSizes: [number, number][] = [
    [0.12, 0.44],
    [0.09, 0.32],
    [0.09, 0.32],
    [0.08, 0.26],
    [0.08, 0.26],
  ];
  const flameColors = [FLAME_B, FLAME_A, FLAME_A, FLAME_B, FLAME_B];

  const strutPositions: [number, number, number, number][] = [
    [0, 0.52 + 0.42 + 0.08, 0, 0],
    [0, -0.52 - 0.3, 0, 0],
    [0.72, 0.12, 0, Math.PI / 2],
    [-0.72, 0.12, 0, Math.PI / 2],
  ];

  const coronaRays: [number, number, number][] = Array.from(
    { length: 8 },
    (_, i): [number, number, number] => {
      const a = (i / 8) * Math.PI * 2;
      return [Math.cos(a) * 1.05, 0.12 + Math.sin(a) * 0.88, 0.12];
    },
  );

  const baseEmissive =
    stage === 'seedling' ? 0.22 : stage === 'sprout' ? 0.42 : stage === 'bloom' ? 0.62 : 0.88;

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Round orb body — perfectly spherical, distinct from all others */}
      <mesh>
        <sphereGeometry args={[0.52, 28, 28]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={color}
          emissiveIntensity={baseEmissive * 0.55}
        />
      </mesh>

      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[0.62, 16, 16]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={color}
          emissiveIntensity={baseEmissive * 0.12}
          transparent
          opacity={0.14}
        />
      </mesh>

      {/* Trailing fire tail below orb */}
      <mesh position={[0, -0.68, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.24, 0.58, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={color}
          emissiveIntensity={0.28}
          transparent
          opacity={0.52}
        />
      </mesh>

      {/* Animated 5-cone flame crown */}
      {flamePositions.map(([x, y, z, rx, ry, rz], i) => {
        // Safe: i is bounded by flamePositions.length (5); all arrays have 5 elements
        // eslint-disable-next-line security/detect-object-injection
        const fSize = flameSizes[i];
        // eslint-disable-next-line security/detect-object-injection
        const fColor = flameColors[i] ?? FLAME_A;
        return (
          <mesh
            key={i}
            ref={(el) => {
              // eslint-disable-next-line security/detect-object-injection
              flames.current[i] = el;
            }}
            position={[x, y, z]}
            rotation={[rx, ry, rz]}
          >
            <coneGeometry args={[fSize?.[0] ?? 0.1, fSize?.[1] ?? 0.3, 8]} />
            <meshBasicMaterial color={fColor} transparent opacity={i === 0 ? 0.95 : 0.82} />
          </mesh>
        );
      })}

      <Face
        irisColor="#7a2800"
        ink="#280e00"
        mood={mood}
        eyeSpan={0.18}
        eyeY={0.06}
        zOffset={0.52}
      />

      {/* Sprout+: orbital spark ring */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[0.88, 0.048, 8, 32]} />
          <meshToonMaterial
            gradientMap={TOON_CRISP}
            color={FLAME_B}
            emissive={FLAME_B}
            emissiveIntensity={0.4}
            transparent
            opacity={0.68}
          />
        </mesh>
      )}

      {/* Bloom+: lantern struts */}
      {(stage === 'bloom' || stage === 'flourish') &&
        strutPositions.map(([x, y, z, rz], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, rz]}>
            <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
            <meshToonMaterial
              gradientMap={TOON_CRISP}
              color={color}
              emissive={color}
              emissiveIntensity={0.28}
              transparent
              opacity={0.58}
            />
          </mesh>
        ))}

      {/* Flourish: 8-ray corona */}
      {stage === 'flourish' &&
        coronaRays.map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <capsuleGeometry args={[0.03, 0.26, 4, 8]} />
            <meshBasicMaterial color={FLAME_B} transparent opacity={0.6} />
          </mesh>
        ))}
    </group>
  );
}

// ─── Maru ─────────────────────────────────────────────────────────────────────
// Moon Bunny — chubby round body with LONG FLOPPY drooping ears.
// Ears hang DOWN and out from sides (lop-rabbit style) — totally unlike Zephyr.
// Spinning crystal rings grow with evolution. Fluffy sphere-cluster tail.
// Silhouette: ROUND body + wide drooping ear extensions (unique shape).
// Therapeutic: slow ring rotation teaches acceptance of natural cycles.
//
// Evolution arc:
//   Perla    → chubby bunny, floppy ears, fluffy tail
//   Creciente → equatorial crystal ring
//   Halo     → tilted second ring + crescent forehead mark
//   Cosmos   → three rings + star-gem octahedra crown

export function MaruMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const CREAM = '#f0e4d8';
  const STAR = '#f8e890';
  const PINK = '#f0a8c0';

  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const ring3Ref = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 0.24;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.16;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 0.12;
  });

  // Floppy lop ears — attached at sides of head, droop outward and down.
  // Rotation [0.55, 0, ±1.45] makes capsule point sideways-downward.
  const earData: [number, number, number, number, number, number][] = [
    [-0.5, 0.38, 0.04, 0.55, 0, -1.45],
    [0.5, 0.38, 0.04, 0.55, 0, 1.45],
  ];

  // Fluffy tail cluster
  const tailPuffs: [number, number, number, number][] = [
    [0, -0.18, -0.38, 0.16],
    [0.14, -0.12, -0.32, 0.11],
    [-0.11, -0.12, -0.32, 0.11],
  ];

  const starCrown: [number, number, number][] = Array.from(
    { length: 5 },
    (_, i): [number, number, number] => {
      const a = (i / 5) * Math.PI * 2;
      return [Math.cos(a) * 0.62, 0.56 + Math.sin(a) * 0.08, Math.sin(a) * 0.4];
    },
  );

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Floppy drooping ears — lop-rabbit style, hang OUT from sides */}
      {earData.map(([x, y, z, rx, ry, rz], i) => (
        <group key={i} position={[x, y, z]} rotation={[rx, ry, rz]}>
          {/* Outer ear */}
          <mesh>
            <capsuleGeometry args={[0.088, 0.46, 4, 10]} />
            <meshToonMaterial gradientMap={TOON} color={color} />
          </mesh>
          {/* Pink inner ear */}
          <mesh position={[0, 0, 0.05]}>
            <capsuleGeometry args={[0.05, 0.32, 4, 10]} />
            <meshToonMaterial gradientMap={TOON_CRISP} color={PINK} />
          </mesh>
        </group>
      ))}

      {/* Chubby round head — rounder than wide */}
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.46, 28, 28]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Plump chubby cheeks */}
      <mesh position={[-0.42, 0.28, 0.3]} scale={[0.88, 0.72, 0.6]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.42, 0.28, 0.3]} scale={[0.88, 0.72, 0.6]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={CREAM} transparent opacity={0.55} />
      </mesh>

      {/* Body */}
      <mesh position={[0, -0.22, 0]} scale={[1.02, 0.96, 1.0]}>
        <sphereGeometry args={[0.32, 22, 22]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Arm nubs */}
      <mesh position={[-0.42, -0.14, 0]}>
        <sphereGeometry args={[0.14, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.42, -0.14, 0]}>
        <sphereGeometry args={[0.14, 14, 14]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      {/* Leg nubs */}
      <mesh position={[-0.16, -0.46, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>
      <mesh position={[0.16, -0.46, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshToonMaterial gradientMap={TOON} color={color} />
      </mesh>

      <Face
        irisColor="#4858c0"
        ink="#181840"
        mood={mood}
        eyeSpan={0.2}
        eyeY={0.44}
        zOffset={0.84}
      />

      {/* Fluffy tail */}
      {tailPuffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshToonMaterial gradientMap={TOON} color={CREAM} />
        </mesh>
      ))}

      {/* Halo+: crescent forehead mark */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <mesh position={[0, 0.68, 0.42]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.024, 6, 20, Math.PI * 1.4]} />
          <meshBasicMaterial color={STAR} />
        </mesh>
      )}

      {/* Creciente+: equatorial crystal ring */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.14, 0.05, 8, 44]} />
          <meshToonMaterial gradientMap={TOON_CRISP} color={color} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Halo+: tilted second ring */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <mesh ref={ring2Ref} rotation={[Math.PI / 2 + 0.68, 0.38, 0]}>
          <torusGeometry args={[1.04, 0.04, 8, 44]} />
          <meshToonMaterial gradientMap={TOON_CRISP} color={color} transparent opacity={0.68} />
        </mesh>
      )}

      {/* Cosmos: third ring + star crown */}
      {stage === 'flourish' && (
        <>
          <mesh ref={ring3Ref} rotation={[0.3, Math.PI / 4, Math.PI / 3]}>
            <torusGeometry args={[0.92, 0.034, 8, 44]} />
            <meshToonMaterial
              gradientMap={TOON_CRISP}
              color={color}
              emissive={color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.58}
            />
          </mesh>
          {starCrown.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} scale={[1, 1.6, 1]}>
              <octahedronGeometry args={[0.08, 0]} />
              <meshBasicMaterial color={STAR} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
