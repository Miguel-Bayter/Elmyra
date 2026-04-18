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

// ─── Zephyr → Ice Penguin ─────────────────────────────────────────────────────
// Looks carved from glacial ice: translucent outer shell, emissive blue glow,
// ice-crystal shards jutting from body, frosted white belly with inner light.
// The whole form shimmers like a living ice sculpture.
//
// Evolution arc:
//   Seedling  → base ice body, 2 crystal shards
//   Sprout    → 4 more shards + ice bow tie
//   Bloom     → glowing ice crown ring, body glow intensifies
//   Flourish  → full aurora shimmer + 8 ice spires around head

export function ZephyrMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const ICE_GLOW = '#b8e8ff';
  const ICE_DEEP = '#70c0f0';
  const ORANGE = '#f07830';
  const FROST = '#e8f8ff';

  // Emissive intensity grows with stage — penguin "brightens" as it evolves
  const iceGlow =
    stage === 'seedling' ? 0.18 : stage === 'sprout' ? 0.32 : stage === 'bloom' ? 0.52 : 0.78;

  // Fixed ice crystal shard positions on body surface
  const baseShards: [number, number, number, number, number, number][] = [
    [-0.32, 0.28, 0.36, 0.4, 0, 0.3],
    [0.3, 0.1, 0.38, -0.3, 0, -0.2],
  ];
  const extraShards: [number, number, number, number, number, number][] = [
    [-0.2, -0.18, 0.4, 0.5, 0, 0.4],
    [0.28, 0.4, 0.3, -0.4, 0, -0.3],
    [-0.36, -0.02, 0.3, 0.2, 0, 0.5],
    [0.16, -0.3, 0.42, 0.3, 0, -0.4],
  ];

  const auroraSpires: [number, number, number][] = Array.from(
    { length: 8 },
    (_, i): [number, number, number] => {
      const a = (i / 8) * Math.PI * 2;
      return [Math.cos(a) * 0.38, 1.18 + Math.abs(Math.sin(a)) * 0.12, Math.sin(a) * 0.16];
    },
  );

  const visibleShards = stage === 'seedling' ? baseShards : [...baseShards, ...extraShards];

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* ── Outer ice shell — translucent glowing skin ── */}
      <mesh scale={[0.86, 1.34, 0.94]}>
        <sphereGeometry args={[0.56, 22, 22]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={ICE_GLOW}
          emissive={ICE_GLOW}
          emissiveIntensity={iceGlow * 0.5}
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* ── Main body — ice-blue core ── */}
      <mesh scale={[0.78, 1.22, 0.85]}>
        <sphereGeometry args={[0.52, 26, 26]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={ICE_DEEP}
          emissiveIntensity={iceGlow * 0.35}
        />
      </mesh>

      {/* ── Frosted belly — glowing white patch ── */}
      <mesh position={[0, -0.04, 0.36]} scale={[0.54, 0.78, 0.18]}>
        <sphereGeometry args={[0.52, 18, 18]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={FROST}
          emissive={FROST}
          emissiveIntensity={iceGlow * 0.6}
        />
      </mesh>

      {/* ── Ice crystal shards jutting from body ── */}
      {visibleShards.map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]} scale={[1, 2.2, 1]}>
          <octahedronGeometry args={[0.055, 0]} />
          <meshBasicMaterial color={FROST} transparent opacity={0.88} />
        </mesh>
      ))}

      {/* ── Head — ice sculpted ── */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={ICE_DEEP}
          emissiveIntensity={iceGlow * 0.28}
        />
      </mesh>

      {/* ── Outer ice shell on head ── */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.41, 18, 18]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={ICE_GLOW}
          emissive={ICE_GLOW}
          emissiveIntensity={iceGlow * 0.4}
          transparent
          opacity={0.18}
        />
      </mesh>

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

      {/* Icy capsule wings — with emissive glow */}
      <mesh position={[-0.58, 0.06, 0]} rotation={[0.2, 0, -0.55]} scale={[0.55, 1, 0.38]}>
        <capsuleGeometry args={[0.12, 0.28, 4, 10]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={ICE_DEEP}
          emissiveIntensity={iceGlow * 0.3}
        />
      </mesh>
      <mesh position={[0.58, 0.06, 0]} rotation={[0.2, 0, 0.55]} scale={[0.55, 1, 0.38]}>
        <capsuleGeometry args={[0.12, 0.28, 4, 10]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={ICE_DEEP}
          emissiveIntensity={iceGlow * 0.3}
        />
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

      {/* Sprout+: ice bow tie — two crystal diamonds */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[-0.11, 0.38, 0.43]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1.6, 0.7]}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshBasicMaterial color={FROST} transparent opacity={0.95} />
          </mesh>
          <mesh position={[0.11, 0.38, 0.43]} rotation={[0, 0, -Math.PI / 4]} scale={[1, 1.6, 0.7]}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshBasicMaterial color={FROST} transparent opacity={0.95} />
          </mesh>
          <mesh position={[0, 0.38, 0.46]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={ICE_GLOW} />
          </mesh>
        </>
      )}

      {/* Bloom+: glowing ice crown ring */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, 1.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.04, 8, 32]} />
            <meshToonMaterial
              gradientMap={TOON_CRISP}
              color={ICE_GLOW}
              emissive={ICE_GLOW}
              emissiveIntensity={0.7}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Crown crystal points */}
          {[-0.3, 0, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 1.12, 0.14]} rotation={[0.3, 0, 0]} scale={[1, 2, 1]}>
              <octahedronGeometry args={[0.06, 0]} />
              <meshBasicMaterial color={FROST} transparent opacity={0.9} />
            </mesh>
          ))}
        </>
      )}

      {/* Flourish: full aurora — 8 ice spires + body aurora */}
      {stage === 'flourish' && (
        <>
          {auroraSpires.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} scale={[1, 2.8, 1]}>
              <octahedronGeometry args={[0.05, 0]} />
              <meshBasicMaterial color={FROST} transparent opacity={0.85} />
            </mesh>
          ))}
          {/* Aurora haze around body */}
          <mesh scale={[0.95, 1.52, 1.0]}>
            <sphereGeometry args={[0.62, 16, 16]} />
            <meshToonMaterial
              gradientMap={TOON}
              color={ICE_GLOW}
              emissive={ICE_GLOW}
              emissiveIntensity={0.5}
              transparent
              opacity={0.1}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// ─── Kova → Ember Cat ─────────────────────────────────────────────────────────
// Looks like it's made of warm living amber: inner ember core glows orange-red,
// body has a warm aura shell, ear tips flicker with heat, tail tip smolders.
// Triangle ears with ember-glow inner pinks, whiskers catch the warm light.
//
// Evolution arc:
//   Seedling → subtle warm body glow
//   Sprout   → glowing ember collar, warm aura visible
//   Bloom    → ear tips glow bright, heat haze shell appears
//   Flourish → full fire crown, body radiates intense amber light

export function KovaMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const EMBER = '#ff6820';
  const EMBER_DEEP = '#c83800';
  const WARM = '#ffb060';
  const CREAM = '#f5e8d8';
  const INNER_EAR = '#ff9060';

  const HEAD_Y = 0.36;

  // Ember glow grows with stage
  const emberGlow =
    stage === 'seedling' ? 0.12 : stage === 'sprout' ? 0.26 : stage === 'bloom' ? 0.44 : 0.68;

  const tailPuffs: [number, number, number, number][] = [
    [0.42, -0.48, -0.1, 0.14],
    [0.6, -0.32, -0.08, 0.12],
    [0.7, -0.12, -0.06, 0.11],
    [0.66, 0.1, -0.04, 0.09],
    [0.58, 0.28, -0.02, 0.08],
  ];

  const whiskerL: [number, number, number, number, number][] = [
    [-0.48, HEAD_Y - 0.04, HEAD_Y + 0.26, 0, 0.18],
    [-0.5, HEAD_Y - 0.1, HEAD_Y + 0.26, 0, 0.12],
  ];
  const whiskerR: [number, number, number, number, number][] = whiskerL.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([x, y, z, _rx, rz]) => [-x, y, z, 0, -rz],
  );

  const firePetals: [number, number, number][] = Array.from(
    { length: 6 },
    (_, i): [number, number, number] => {
      const a = (i / 6) * Math.PI * 2;
      return [Math.cos(a) * 0.2, HEAD_Y + 0.54 + Math.abs(Math.sin(a)) * 0.1, 0.3];
    },
  );

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* ── Warm aura outer shell ── */}
      <mesh position={[0, HEAD_Y * 0.3, 0]} scale={[1.22, 1.18, 1.14]}>
        <sphereGeometry args={[0.52, 18, 18]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={WARM}
          emissive={EMBER}
          emissiveIntensity={emberGlow * 0.45}
          transparent
          opacity={0.14}
        />
      </mesh>

      {/* Triangle ears — ember-tipped */}
      <mesh position={[-0.26, HEAD_Y + 0.38, 0.04]} rotation={[0, 0, 0.22]} scale={[1, 1.5, 0.6]}>
        <coneGeometry args={[0.14, 0.3, 4]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={EMBER_DEEP}
          emissiveIntensity={emberGlow * 0.4}
        />
      </mesh>
      <mesh position={[0.26, HEAD_Y + 0.38, 0.04]} rotation={[0, 0, -0.22]} scale={[1, 1.5, 0.6]}>
        <coneGeometry args={[0.14, 0.3, 4]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={EMBER_DEEP}
          emissiveIntensity={emberGlow * 0.4}
        />
      </mesh>
      {/* Glowing inner ear */}
      <mesh position={[-0.26, HEAD_Y + 0.38, 0.1]} rotation={[0, 0, 0.22]} scale={[0.6, 1.2, 0.2]}>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshToonMaterial
          gradientMap={TOON_CRISP}
          color={INNER_EAR}
          emissive={EMBER}
          emissiveIntensity={emberGlow * 0.8}
        />
      </mesh>
      <mesh position={[0.26, HEAD_Y + 0.38, 0.1]} rotation={[0, 0, -0.22]} scale={[0.6, 1.2, 0.2]}>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshToonMaterial
          gradientMap={TOON_CRISP}
          color={INNER_EAR}
          emissive={EMBER}
          emissiveIntensity={emberGlow * 0.8}
        />
      </mesh>

      {/* Round head — warm amber glow */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.42, 26, 26]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={EMBER_DEEP}
          emissiveIntensity={emberGlow * 0.22}
        />
      </mesh>

      {/* Cheek puffs — warm cream */}
      <mesh position={[-0.36, HEAD_Y - 0.08, 0.3]} scale={[0.9, 0.7, 0.6]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CREAM}
          emissive={WARM}
          emissiveIntensity={emberGlow * 0.3}
          transparent
          opacity={0.65}
        />
      </mesh>
      <mesh position={[0.36, HEAD_Y - 0.08, 0.3]} scale={[0.9, 0.7, 0.6]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CREAM}
          emissive={WARM}
          emissiveIntensity={emberGlow * 0.3}
          transparent
          opacity={0.65}
        />
      </mesh>

      <Face
        irisColor="#8a3010"
        ink="#2a0e00"
        mood={mood}
        eyeSpan={0.19}
        eyeY={HEAD_Y + 0.06}
        zOffset={HEAD_Y + 0.42}
      />

      {/* Whiskers — catch warm light */}
      {[...whiskerL, ...whiskerR].map(([x, y, z, rx, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, 0, rz]}>
          <boxGeometry args={[0.22, 0.018, 0.012]} />
          <meshBasicMaterial color={WARM} transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Plump body — ember core */}
      <mesh position={[0, -0.22, 0]} scale={[1.08, 1.0, 0.96]}>
        <capsuleGeometry args={[0.26, 0.22, 6, 18]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={EMBER_DEEP}
          emissiveIntensity={emberGlow * 0.25}
        />
      </mesh>

      {/* Inner ember core — hot center */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={EMBER}
          emissive={EMBER}
          emissiveIntensity={emberGlow * 0.9}
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Arm nubs */}
      <mesh position={[-0.44, -0.12, 0.06]} scale={[0.72, 1.1, 0.72]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={EMBER_DEEP}
          emissiveIntensity={emberGlow * 0.2}
        />
      </mesh>
      <mesh position={[0.44, -0.12, 0.06]} scale={[0.72, 1.1, 0.72]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={EMBER_DEEP}
          emissiveIntensity={emberGlow * 0.2}
        />
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

      {/* Tail — smoldering sphere chain */}
      {tailPuffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshToonMaterial
            gradientMap={TOON}
            color={color}
            emissive={EMBER_DEEP}
            emissiveIntensity={emberGlow * (0.15 + i * 0.04)}
          />
        </mesh>
      ))}
      {/* Smoldering tail tip — hottest point */}
      <mesh position={[0.52, 0.36, -0.02]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={WARM}
          emissive={EMBER}
          emissiveIntensity={emberGlow * 1.1}
        />
      </mesh>

      {/* Sprout+: glowing ember collar */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.04, 6, 28]} />
            <meshToonMaterial
              gradientMap={TOON_CRISP}
              color={WARM}
              emissive={EMBER}
              emissiveIntensity={0.6}
              transparent
              opacity={0.95}
            />
          </mesh>
          <mesh position={[0, 0.08, 0.34]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color={EMBER} />
          </mesh>
        </>
      )}

      {/* Bloom+: heat haze shell intensifies */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, HEAD_Y * 0.3, 0]} scale={[1.35, 1.3, 1.28]}>
            <sphereGeometry args={[0.52, 14, 14]} />
            <meshToonMaterial
              gradientMap={TOON}
              color={EMBER}
              emissive={EMBER}
              emissiveIntensity={0.35}
              transparent
              opacity={0.1}
            />
          </mesh>
        </>
      )}

      {/* Flourish: fire crown + max glow */}
      {stage === 'flourish' && (
        <>
          {firePetals.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} scale={[1, 1.8, 0.8]}>
              <coneGeometry args={[0.06, 0.18, 6]} />
              <meshBasicMaterial color={i % 2 === 0 ? EMBER : WARM} transparent opacity={0.9} />
            </mesh>
          ))}
          <mesh position={[0, HEAD_Y + 0.54, 0.28]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={WARM} />
          </mesh>
        </>
      )}
    </group>
  );
}

// ─── Luma → Honey Bear ────────────────────────────────────────────────────────
// Looks dipped in living liquid gold: body radiates warm amber emissive light,
// outer honey-shimmer shell, paw pads glow warm, halo drips with golden light.
// The whole form feels like solidified warmth — glowing from the inside out.
//
// Evolution arc:
//   Seedling → subtle warm golden glow
//   Sprout   → honey drip + visible amber aura
//   Bloom    → flower + strong golden shell
//   Flourish → radiant halo + full amber radiance

export function LumaMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const HONEY = '#f0a830';
  const HONEY_DEEP = '#c07010';
  const GOLD = '#f8e060';
  const CREAM = '#fff8e8';
  const PINK = '#f8c8a8';

  const HEAD_Y = 0.42;

  // Golden glow intensifies with each evolution stage
  const goldGlow =
    stage === 'seedling' ? 0.15 : stage === 'sprout' ? 0.3 : stage === 'bloom' ? 0.52 : 0.82;

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* ── Honey shimmer outer shell ── */}
      <mesh position={[0, HEAD_Y * 0.2, 0]} scale={[1.18, 1.14, 1.12]}>
        <sphereGeometry args={[0.52, 18, 18]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={GOLD}
          emissive={HONEY}
          emissiveIntensity={goldGlow * 0.45}
          transparent
          opacity={0.16}
        />
      </mesh>

      {/* Dome ear bumps — golden-glowing */}
      <mesh position={[-0.3, HEAD_Y + 0.36, 0.04]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.35}
        />
      </mesh>
      <mesh position={[0.3, HEAD_Y + 0.36, 0.04]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.35}
        />
      </mesh>
      {/* Inner ear — warm honey glow */}
      <mesh position={[-0.3, HEAD_Y + 0.36, 0.18]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial
          gradientMap={TOON_CRISP}
          color={PINK}
          emissive={HONEY}
          emissiveIntensity={goldGlow * 0.6}
        />
      </mesh>
      <mesh position={[0.3, HEAD_Y + 0.36, 0.18]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial
          gradientMap={TOON_CRISP}
          color={PINK}
          emissive={HONEY}
          emissiveIntensity={goldGlow * 0.6}
        />
      </mesh>

      {/* Round head — golden amber glow */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.44, 26, 26]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.28}
        />
      </mesh>

      {/* Round protruding snout — honey-cream */}
      <mesh position={[0, HEAD_Y - 0.1, 0.36]} scale={[1.1, 0.8, 0.62]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CREAM}
          emissive={GOLD}
          emissiveIntensity={goldGlow * 0.5}
        />
      </mesh>
      <mesh position={[0, HEAD_Y - 0.04, 0.54]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#5a2010" />
      </mesh>

      <Face
        irisColor="#7a4000"
        ink="#2a1400"
        mood={mood}
        eyeSpan={0.18}
        eyeY={HEAD_Y + 0.1}
        zOffset={HEAD_Y + 0.42}
      />

      {/* Plump round body — radiant gold */}
      <mesh position={[0, -0.16, 0]} scale={[1.06, 1.0, 0.98]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.32}
        />
      </mesh>

      {/* Golden honey tummy patch */}
      <mesh position={[0, -0.14, 0.36]} scale={[0.62, 0.72, 0.2]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CREAM}
          emissive={GOLD}
          emissiveIntensity={goldGlow * 0.55}
        />
      </mesh>

      {/* Stubby arm paws — warm gold */}
      <mesh position={[-0.52, -0.08, 0.1]} scale={[0.78, 1.1, 0.78]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.25}
        />
      </mesh>
      <mesh position={[0.52, -0.08, 0.1]} scale={[0.78, 1.1, 0.78]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.25}
        />
      </mesh>
      {/* Glowing paw pads */}
      <mesh position={[-0.56, -0.12, 0.22]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial
          gradientMap={TOON_CRISP}
          color={CREAM}
          emissive={GOLD}
          emissiveIntensity={goldGlow * 0.7}
        />
      </mesh>
      <mesh position={[0.56, -0.12, 0.22]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial
          gradientMap={TOON_CRISP}
          color={CREAM}
          emissive={GOLD}
          emissiveIntensity={goldGlow * 0.7}
        />
      </mesh>

      {/* Round feet */}
      <mesh position={[-0.16, -0.54, 0.1]} scale={[1.3, 0.62, 1.2]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.18}
        />
      </mesh>
      <mesh position={[0.16, -0.54, 0.1]} scale={[1.3, 0.62, 1.2]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={HONEY_DEEP}
          emissiveIntensity={goldGlow * 0.18}
        />
      </mesh>

      {/* Sprout+: glowing honey drop + amber aura */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[0, -0.04, 0.55]} scale={[1, 1.5, 1]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color={HONEY} />
          </mesh>
          <mesh position={[0, -0.22, 0.54]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.07, 0.16, 8]} />
            <meshBasicMaterial color={HONEY} />
          </mesh>
          {/* Honey drip drop */}
          <mesh position={[0, -0.34, 0.52]} scale={[1, 1.6, 1]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={HONEY_DEEP} />
          </mesh>
        </>
      )}

      {/* Bloom+: flower behind ear + golden aura shell */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <mesh position={[-0.44, HEAD_Y + 0.44, 0.1]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={GOLD} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[-0.44 + Math.cos(a) * 0.11, HEAD_Y + 0.44 + Math.sin(a) * 0.11, 0.06]}
              >
                <sphereGeometry args={[0.065, 8, 8]} />
                <meshBasicMaterial color={PINK} transparent opacity={0.9} />
              </mesh>
            );
          })}
          {/* Golden aura shell */}
          <mesh position={[0, HEAD_Y * 0.2, 0]} scale={[1.32, 1.28, 1.26]}>
            <sphereGeometry args={[0.52, 14, 14]} />
            <meshToonMaterial
              gradientMap={TOON}
              color={GOLD}
              emissive={GOLD}
              emissiveIntensity={0.3}
              transparent
              opacity={0.1}
            />
          </mesh>
        </>
      )}

      {/* Flourish: radiant golden halo */}
      {stage === 'flourish' && (
        <>
          <mesh position={[0, HEAD_Y + 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.048, 8, 36]} />
            <meshToonMaterial
              gradientMap={TOON_CRISP}
              color={GOLD}
              emissive={GOLD}
              emissiveIntensity={0.9}
            />
          </mesh>
          {/* Halo sparkle dots */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(a) * 0.32,
                  HEAD_Y + 0.72 + Math.sin(a) * 0.04,
                  Math.sin(a) * 0.08,
                ]}
              >
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color={GOLD} />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
}

// ─── Maru → Crystal Duck ──────────────────────────────────────────────────────
// Looks sculpted from living amethyst crystal: translucent outer body glows
// with inner purple light, wing pads shimmer like crystal facets, spinning rings
// are made of pure light. The beak and feet are warm amber — contrast of warmth.
//
// Evolution arc:
//   Seedling → subtle crystal glow, translucent body shell
//   Sprout   → daisy + crystal shimmer brightens
//   Bloom    → spinning crystal ring of light
//   Flourish → second orbital ring + crown of crystal spires

export function MaruMesh({
  stage,
  mood,
  color,
  reactionKey,
}: CompanionMeshProps): React.JSX.Element {
  const { groupRef, handleClick } = useCompanionAnimation(mood, reactionKey);
  const CRYSTAL = '#d0a8ff';
  const CRYSTAL_DEEP = '#8060c0';
  const ORANGE = '#f08030';
  const DAISY = '#f8f0a0';
  const CRYSTAL_LIGHT = '#f0e8ff';

  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useFrame((_, delta) => {
    if (prefersReduced.current) return;
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 0.32;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.22;
  });

  const HEAD_Y = 0.58;

  // Crystal glow grows with stage
  const crystalGlow =
    stage === 'seedling' ? 0.2 : stage === 'sprout' ? 0.38 : stage === 'bloom' ? 0.58 : 0.85;

  const crownSpires: [number, number, number][] = Array.from(
    { length: 6 },
    (_, i): [number, number, number] => {
      const a = (i / 6) * Math.PI * 2;
      return [
        Math.cos(a) * 0.32,
        HEAD_Y + 0.52 + Math.abs(Math.sin(a * 1.5)) * 0.1,
        Math.sin(a) * 0.1,
      ];
    },
  );

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* ── Outer crystal shell — translucent purple glow ── */}
      <mesh position={[0, -0.06, 0]} scale={[1.18, 1.1, 1.08]}>
        <sphereGeometry args={[0.52, 20, 20]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CRYSTAL}
          emissive={CRYSTAL_DEEP}
          emissiveIntensity={crystalGlow * 0.5}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* ── Inner crystal core — bright purple heart ── */}
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.3, 14, 14]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CRYSTAL_LIGHT}
          emissive={CRYSTAL}
          emissiveIntensity={crystalGlow * 0.8}
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Large puffball body — crystal lavender */}
      <mesh position={[0, -0.06, 0]} scale={[1.08, 1.0, 0.98]}>
        <sphereGeometry args={[0.52, 28, 28]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={CRYSTAL_DEEP}
          emissiveIntensity={crystalGlow * 0.28}
        />
      </mesh>

      {/* Crystal wing pads — semi-transparent faceted */}
      <mesh position={[-0.58, 0.04, 0.14]} scale={[0.62, 1.0, 0.36]} rotation={[0, 0.3, 0.4]}>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CRYSTAL_LIGHT}
          emissive={CRYSTAL}
          emissiveIntensity={crystalGlow * 0.5}
          transparent
          opacity={0.75}
        />
      </mesh>
      <mesh position={[0.58, 0.04, 0.14]} scale={[0.62, 1.0, 0.36]} rotation={[0, -0.3, -0.4]}>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CRYSTAL_LIGHT}
          emissive={CRYSTAL}
          emissiveIntensity={crystalGlow * 0.5}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Tail feather bump — crystal shimmer */}
      <mesh position={[0, 0.14, -0.46]} scale={[0.7, 0.8, 0.6]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={CRYSTAL_DEEP}
          emissiveIntensity={crystalGlow * 0.4}
        />
      </mesh>

      {/* Small round head — crystal glow */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={color}
          emissive={CRYSTAL_DEEP}
          emissiveIntensity={crystalGlow * 0.3}
        />
      </mesh>
      {/* Head outer shell */}
      <mesh position={[0, HEAD_Y, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshToonMaterial
          gradientMap={TOON}
          color={CRYSTAL}
          emissive={CRYSTAL}
          emissiveIntensity={crystalGlow * 0.35}
          transparent
          opacity={0.15}
        />
      </mesh>

      <Face
        irisColor="#4050b8"
        ink="#181830"
        mood={mood}
        eyeSpan={0.16}
        eyeY={HEAD_Y + 0.06}
        zOffset={HEAD_Y + 0.36}
      />

      {/* Wide flat warm beak */}
      <mesh
        position={[0, HEAD_Y - 0.04, 0.3]}
        rotation={[Math.PI / 2.2, 0, 0]}
        scale={[1.4, 1, 0.6]}
      >
        <coneGeometry args={[0.1, 0.22, 8]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>

      {/* Warm amber feet — contrast against crystal */}
      <mesh position={[-0.16, -0.54, 0.12]} scale={[1.5, 0.5, 1.3]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>
      <mesh position={[0.16, -0.54, 0.12]} scale={[1.5, 0.5, 1.3]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshToonMaterial gradientMap={TOON_CRISP} color={ORANGE} />
      </mesh>

      {/* Sprout+: crystal daisy on head */}
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
                <meshBasicMaterial color={CRYSTAL_LIGHT} transparent opacity={0.9} />
              </mesh>
            );
          })}
          <mesh position={[0, HEAD_Y + 0.32, 0.34]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color={DAISY} />
          </mesh>
        </>
      )}

      {/* Bloom+: glowing crystal ring of light */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.06, 0.05, 8, 44]} />
          <meshToonMaterial
            gradientMap={TOON_CRISP}
            color={CRYSTAL_LIGHT}
            emissive={CRYSTAL}
            emissiveIntensity={0.7}
            transparent
            opacity={0.82}
          />
        </mesh>
      )}

      {/* Flourish: second orbital ring + crystal spire crown */}
      {stage === 'flourish' && (
        <>
          <mesh ref={ring2Ref} rotation={[Math.PI / 2 + 0.62, 0.42, 0]}>
            <torusGeometry args={[0.9, 0.042, 8, 40]} />
            <meshToonMaterial
              gradientMap={TOON_CRISP}
              color={CRYSTAL}
              emissive={CRYSTAL_DEEP}
              emissiveIntensity={0.55}
              transparent
              opacity={0.75}
            />
          </mesh>
          {/* Crystal spire crown */}
          {crownSpires.map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} scale={[1, 2.5, 1]}>
              <octahedronGeometry args={[0.055, 0]} />
              <meshBasicMaterial color={CRYSTAL_LIGHT} transparent opacity={0.9} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
