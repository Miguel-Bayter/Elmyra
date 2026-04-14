// Original SVG companion designs for Elmyra.
// Four distinct species — Felis, Spectra, Dolcis, Lumis — each with
// 4 evolution stages and 6 mood expressions driven by the companion entity model.
// R3 compliant: zero React style={} props. SVG presentation attributes are element
// properties, not inline styles, and are explicitly allowed.

import React from 'react';
import type { CompanionMood, CompanionStage } from '../../model/types';

// ─── Face expression type & mood mapping ─────────────────────────────────────

type FaceExpr = 'happy' | 'blissful' | 'sad' | 'shocked' | 'lovestruck' | 'resting';

const MOOD_TO_EXPR: Record<CompanionMood, FaceExpr> = {
  radiant: 'blissful',
  calm: 'happy',
  restless: 'shocked',
  weary: 'sad',
  fragile: 'sad',
  resting: 'resting',
};

// ─── Shared face rendering ────────────────────────────────────────────────────

interface EyeProps {
  x: number;
  y: number;
  expr: FaceExpr;
  ink: string;
}

function Eye({ x, y, expr, ink }: EyeProps): React.JSX.Element {
  if (expr === 'shocked') {
    return <circle cx={x} cy={y} r={6.5} fill={ink} opacity={0.72} />;
  }
  if (expr === 'lovestruck') {
    // Tiny heart: two small arcs + bottom point
    const d = `M ${x},${y - 1.5}
      C ${x - 0.5},${y - 6} ${x - 8},${y - 6} ${x - 8},${y - 2}
      C ${x - 8},${y + 2} ${x},${y + 6.5} ${x},${y + 6.5}
      C ${x},${y + 6.5} ${x + 8},${y + 2} ${x + 8},${y - 2}
      C ${x + 8},${y - 6} ${x + 0.5},${y - 6} ${x},${y - 1.5} Z`;
    return <path d={d} fill={ink} opacity={0.68} />;
  }
  if (expr === 'happy') {
    const d = `M ${x - 7},${y + 3} Q ${x},${y - 6} ${x + 7},${y + 3}`;
    return (
      <path d={d} fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" opacity={0.78} />
    );
  }
  if (expr === 'blissful') {
    const d = `M ${x - 5.5},${y} Q ${x},${y - 4} ${x + 5.5},${y}`;
    return (
      <path d={d} fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" opacity={0.72} />
    );
  }
  if (expr === 'sad') {
    const d = `M ${x - 7},${y - 3} Q ${x},${y + 6} ${x + 7},${y - 3}`;
    return (
      <path d={d} fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" opacity={0.72} />
    );
  }
  // resting
  return (
    <line
      x1={x - 5}
      y1={y}
      x2={x + 5}
      y2={y}
      stroke={ink}
      strokeWidth={2.3}
      strokeLinecap="round"
      opacity={0.58}
    />
  );
}

interface MouthProps {
  x: number;
  y: number;
  expr: FaceExpr;
  ink: string;
}

function Mouth({ x, y, expr, ink }: MouthProps): React.JSX.Element {
  if (expr === 'shocked') {
    return <ellipse cx={x} cy={y + 5} rx={5.5} ry={7.5} fill={ink} opacity={0.52} />;
  }
  if (expr === 'sad') {
    const d = `M ${x - 9},${y} Q ${x},${y - 8} ${x + 9},${y}`;
    return (
      <path d={d} fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" opacity={0.68} />
    );
  }
  if (expr === 'blissful') {
    const d = `M ${x - 9},${y} Q ${x},${y + 7.5} ${x + 9},${y}`;
    return (
      <path d={d} fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" opacity={0.72} />
    );
  }
  if (expr === 'lovestruck') {
    const d = `M ${x - 11},${y} Q ${x},${y + 10} ${x + 11},${y}`;
    return (
      <path d={d} fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" opacity={0.68} />
    );
  }
  if (expr === 'resting') {
    return (
      <line
        x1={x - 6}
        y1={y + 2}
        x2={x + 6}
        y2={y + 2}
        stroke={ink}
        strokeWidth={2.3}
        strokeLinecap="round"
        opacity={0.5}
      />
    );
  }
  // happy
  const d = `M ${x - 10},${y} Q ${x},${y + 9} ${x + 10},${y}`;
  return (
    <path d={d} fill="none" stroke={ink} strokeWidth={2.3} strokeLinecap="round" opacity={0.72} />
  );
}

// ─── Companion SVG props ──────────────────────────────────────────────────────

export interface CompanionSVGProps {
  stage: CompanionStage;
  mood: CompanionMood;
  color: string; // main body hex — from species config
  size: number;
}

// ─── Felis ────────────────────────────────────────────────────────────────────
// Cat-spirit. Round blob with pointed ears and a curling tail.
// Grows from wild nature (seedling) to cybernetic legend (flourish).
// Palette: soft lavender → deep violet.

export function FelisSVG({ stage, mood, color, size }: CompanionSVGProps): React.JSX.Element {
  // Safe: mood is a typed union — MOOD_TO_EXPR covers all variants, never user input
  // eslint-disable-next-line security/detect-object-injection
  const expr = MOOD_TO_EXPR[mood];
  const ink = '#2d1f3a';

  const innerEar =
    stage === 'seedling'
      ? '#f0e2ff'
      : stage === 'sprout'
        ? '#d8c2f4'
        : stage === 'bloom'
          ? '#b898e0'
          : '#9065c5';

  const blush = stage === 'seedling' ? '#dba8f0' : '#c078d8';

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      {/* Tail — thick curving stroke */}
      <path
        d="M 50,152 Q 18,170 22,138 Q 26,108 50,118"
        fill="none"
        stroke={color}
        strokeWidth={17}
        strokeLinecap="round"
      />

      {/* Ear bases */}
      <polygon points="60,76 43,38 82,66" fill={color} />
      <polygon points="140,76 157,38 118,66" fill={color} />

      {/* Inner ears */}
      <polygon points="62,72 50,46 78,65" fill={innerEar} opacity={0.72} />
      <polygon points="138,72 150,46 122,65" fill={innerEar} opacity={0.72} />

      {/* Main body */}
      <ellipse cx={100} cy={120} rx={67} ry={62} fill={color} />

      {/* Blush */}
      <ellipse cx={73} cy={128} rx={12} ry={7.5} fill={blush} opacity={0.42} />
      <ellipse cx={127} cy={128} rx={12} ry={7.5} fill={blush} opacity={0.42} />

      {/* Face */}
      <Eye x={85} y={110} expr={expr} ink={ink} />
      <Eye x={115} y={110} expr={expr} ink={ink} />
      <Mouth x={100} y={123} expr={expr} ink={ink} />

      {/* Sprout+: golden star badge near right ear */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <g transform="translate(152,52)">
          <circle r={10} fill="#f0d870" opacity={0.88} />
          <path
            d="M 0,-7 L 1.7,-2.5 L 6.7,-2.5 L 2.8,0.9 L 4.1,6 L 0,3 L -4.1,6 L -2.8,0.9 L -6.7,-2.5 L -1.7,-2.5 Z"
            fill="#c89820"
            opacity={0.82}
          />
        </g>
      )}

      {/* Bloom+: double chevron on lower body */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <path
          d="M 86,152 L 93,143 L 100,152 L 107,143 L 114,152"
          fill="none"
          stroke={innerEar}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.68}
        />
      )}

      {/* Flourish: cyber augment lines beside left eye */}
      {stage === 'flourish' && (
        <>
          <line
            x1={56}
            y1={102}
            x2={70}
            y2={106}
            stroke="#9065c5"
            strokeWidth={1.9}
            strokeLinecap="round"
            opacity={0.68}
          />
          <line
            x1={56}
            y1={109}
            x2={67}
            y2={111}
            stroke="#9065c5"
            strokeWidth={1.9}
            strokeLinecap="round"
            opacity={0.48}
          />
          <circle cx={54} cy={101} r={3.2} fill="#9065c5" opacity={0.72} />
        </>
      )}
    </svg>
  );
}

// ─── Spectra ──────────────────────────────────────────────────────────────────
// Cosmic ghost. Ethereal wisp that journeys outward until it becomes an infinite universe.
// Palette: pale ice → deep space navy.

export function SpectraSVG({ stage, mood, color, size }: CompanionSVGProps): React.JSX.Element {
  // Safe: mood is a typed union — MOOD_TO_EXPR covers all variants, never user input
  // eslint-disable-next-line security/detect-object-injection
  const expr = MOOD_TO_EXPR[mood];
  const ink = '#1a2840';
  const glow =
    stage === 'seedling'
      ? '#c8e8f8'
      : stage === 'sprout'
        ? '#88b4e0'
        : stage === 'bloom'
          ? '#4878c0'
          : '#a0c4f0';

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      {/* Ambient sparkles — present at all stages */}
      <circle cx={43} cy={68} r={2.8} fill={glow} opacity={0.58} />
      <circle cx={160} cy={74} r={2.2} fill={glow} opacity={0.48} />
      <circle cx={48} cy={132} r={2.2} fill={glow} opacity={0.4} />
      <circle cx={156} cy={126} r={2.8} fill={glow} opacity={0.48} />

      {/* Sprout+: halo ring above head */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <ellipse
          cx={100}
          cy={52}
          rx={30}
          ry={9}
          fill="none"
          stroke={glow}
          strokeWidth={2.6}
          opacity={0.62}
        />
      )}

      {/* Bloom+: dashed orbital ring */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <ellipse
          cx={100}
          cy={108}
          rx={78}
          ry={21}
          fill="none"
          stroke={glow}
          strokeWidth={1.8}
          strokeDasharray="5 3"
          opacity={0.42}
        />
      )}

      {/* Flourish: constellation dots + lines */}
      {stage === 'flourish' && (
        <>
          <circle cx={34} cy={102} r={3.2} fill={color} opacity={0.68} />
          <circle cx={166} cy={106} r={3.2} fill={color} opacity={0.68} />
          <circle cx={42} cy={82} r={2.2} fill={color} opacity={0.52} />
          <circle cx={158} cy={86} r={2.2} fill={color} opacity={0.52} />
          <line x1={34} y1={102} x2={42} y2={82} stroke={color} strokeWidth={1.2} opacity={0.36} />
          <line
            x1={166}
            y1={106}
            x2={158}
            y2={86}
            stroke={color}
            strokeWidth={1.2}
            opacity={0.36}
          />
          <circle cx={100} cy={170} r={2.5} fill={glow} opacity={0.4} />
        </>
      )}

      {/* Ghost body: round head + wavy skirt */}
      <path
        d={`M 52,120
          Q 52,56 100,50
          Q 148,56 148,120
          Q 148,150 134,144
          Q 120,138 110,148
          Q 100,156 90,148
          Q 80,138 66,144
          Q 52,150 52,120 Z`}
        fill={color}
      />

      {/* Face */}
      <Eye x={85} y={104} expr={expr} ink={ink} />
      <Eye x={115} y={104} expr={expr} ink={ink} />
      <Mouth x={100} y={117} expr={expr} ink={ink} />
    </svg>
  );
}

// ─── Dolcis ───────────────────────────────────────────────────────────────────
// Cream puff. A very round mochi-like creature that warms up and finds its voice.
// Palette: vanilla cream → rich mahogany.

export function DolcisSVG({ stage, mood, color, size }: CompanionSVGProps): React.JSX.Element {
  // Safe: mood is a typed union — MOOD_TO_EXPR covers all variants, never user input
  // eslint-disable-next-line security/detect-object-injection
  const expr = MOOD_TO_EXPR[mood];
  const ink = '#3a1808';
  const accent =
    stage === 'seedling'
      ? '#f4c090'
      : stage === 'sprout'
        ? '#e0a060'
        : stage === 'bloom'
          ? '#c07030'
          : '#904020';

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      {/* Bloom+: steam wisps rising above head */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <path
            d="M 87,53 Q 83,44 87,35 Q 91,26 87,18"
            fill="none"
            stroke={color}
            strokeWidth={3.2}
            strokeLinecap="round"
            opacity={0.42}
          />
          <path
            d="M 100,48 Q 96,39 100,30 Q 104,21 100,13"
            fill="none"
            stroke={color}
            strokeWidth={3.2}
            strokeLinecap="round"
            opacity={0.34}
          />
          <path
            d="M 113,53 Q 109,44 113,35 Q 117,26 113,18"
            fill="none"
            stroke={color}
            strokeWidth={3.2}
            strokeLinecap="round"
            opacity={0.42}
          />
        </>
      )}

      {/* Ear nubs */}
      <circle cx={65} cy={68} r={15} fill={color} />
      <circle cx={135} cy={68} r={15} fill={color} />

      {/* Main body */}
      <circle cx={100} cy={118} r={72} fill={color} />

      {/* Inner ear tints */}
      <circle cx={65} cy={68} r={8.5} fill={accent} opacity={0.42} />
      <circle cx={135} cy={68} r={8.5} fill={accent} opacity={0.42} />

      {/* Sprout+: belly swirl mark */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <path
          d="M 100,90 Q 109,91 109,100 Q 109,109 100,109 Q 92,109 92,101 Q 92,95 98,94"
          fill="none"
          stroke={accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.65}
        />
      )}

      {/* Blush */}
      <ellipse cx={73} cy={128} rx={13} ry={8} fill={accent} opacity={0.38} />
      <ellipse cx={127} cy={128} rx={13} ry={8} fill={accent} opacity={0.38} />

      {/* Face */}
      <Eye x={86} y={112} expr={expr} ink={ink} />
      <Eye x={114} y={112} expr={expr} ink={ink} />
      <Mouth x={100} y={126} expr={expr} ink={ink} />

      {/* Flourish: halo ring */}
      {stage === 'flourish' && (
        <ellipse
          cx={100}
          cy={55}
          rx={34}
          ry={10}
          fill="none"
          stroke={accent}
          strokeWidth={3}
          opacity={0.52}
        />
      )}
    </svg>
  );
}

// ─── Lumis ────────────────────────────────────────────────────────────────────
// Story keeper. A living book-creature that fills with experience and becomes a timeless relic.
// Palette: fresh parchment → ancient bronze.

export function LumisSVG({ stage, mood, color, size }: CompanionSVGProps): React.JSX.Element {
  // Safe: mood is a typed union — MOOD_TO_EXPR covers all variants, never user input
  // eslint-disable-next-line security/detect-object-injection
  const expr = MOOD_TO_EXPR[mood];
  const ink = '#2d1f08';
  const pageColor =
    stage === 'seedling'
      ? '#fffef5'
      : stage === 'sprout'
        ? '#fef9df'
        : stage === 'bloom'
          ? '#fef2bc'
          : '#fde8a0';
  const accent =
    stage === 'seedling'
      ? '#d4b840'
      : stage === 'sprout'
        ? '#c8a820'
        : stage === 'bloom'
          ? '#b09010'
          : '#986008';

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      {/* Book body */}
      <rect x={30} y={53} width={140} height={122} rx={15} ry={15} fill={color} />

      {/* Spine overlay (slightly darker) */}
      <rect x={30} y={53} width={26} height={122} rx={14} ry={14} fill={accent} opacity={0.42} />

      {/* Page area */}
      <rect x={56} y={61} width={106} height={106} rx={5} ry={5} fill={pageColor} opacity={0.58} />

      {/* Bookmark ribbon */}
      <polygon
        points={`${142},53 ${142},92 ${134},84 ${126},92 ${126},53`}
        fill={accent}
        opacity={0.82}
      />

      {/* Sprout+: three ruling lines */}
      {(stage === 'sprout' || stage === 'bloom' || stage === 'flourish') && (
        <>
          <line x1={66} y1={88} x2={152} y2={88} stroke={accent} strokeWidth={1.5} opacity={0.32} />
          <line
            x1={66}
            y1={101}
            x2={152}
            y2={101}
            stroke={accent}
            strokeWidth={1.5}
            opacity={0.32}
          />
          <line
            x1={66}
            y1={114}
            x2={152}
            y2={114}
            stroke={accent}
            strokeWidth={1.5}
            opacity={0.32}
          />
        </>
      )}

      {/* Bloom+: corner flourish arcs */}
      {(stage === 'bloom' || stage === 'flourish') && (
        <>
          <path
            d="M 62,67 Q 62,77 72,77"
            fill="none"
            stroke={accent}
            strokeWidth={2.1}
            opacity={0.52}
          />
          <path
            d="M 148,67 Q 148,77 138,77"
            fill="none"
            stroke={accent}
            strokeWidth={2.1}
            opacity={0.52}
          />
          <path
            d="M 62,159 Q 62,149 72,149"
            fill="none"
            stroke={accent}
            strokeWidth={2.1}
            opacity={0.52}
          />
          <path
            d="M 148,159 Q 148,149 138,149"
            fill="none"
            stroke={accent}
            strokeWidth={2.1}
            opacity={0.52}
          />
        </>
      )}

      {/* Flourish: ornate 10-pointed star above face */}
      {stage === 'flourish' && (
        <path
          d="M 109,76 L 111.5,83 L 119,83 L 113,87.5 L 115.5,94.5 L 109,90 L 102.5,94.5 L 105,87.5 L 99,83 L 106.5,83 Z"
          fill={accent}
          opacity={0.82}
        />
      )}

      {/* Face — centered in page area (pages span x:56→162, center ≈ 109) */}
      <Eye x={95} y={108} expr={expr} ink={ink} />
      <Eye x={122} y={108} expr={expr} ink={ink} />
      <Mouth x={108} y={123} expr={expr} ink={ink} />
    </svg>
  );
}
