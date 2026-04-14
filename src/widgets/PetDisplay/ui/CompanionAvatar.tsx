// Inline SVG companions — one per growth stage.
// No external image requests (security + offline-first).
// Designs are intentionally soft and round — calming for anxiety context (R7).

import React from 'react';
import type { CompanionMood, CompanionStage } from '@entities/companion';

interface AvatarProps {
  mood: CompanionMood;
}

// ─── Seedling ─────────────────────────────────────────────────────────────────
function SeedlingAvatar({ mood }: AvatarProps): React.JSX.Element {
  const eyeColor = mood === 'resting' || mood === 'weary' ? '#c3aee0' : '#3d3d3d';
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      {/* Body */}
      <circle cx="50" cy="60" r="28" fill="#c3aee0" />
      {/* Tiny leaf on top */}
      <ellipse cx="50" cy="32" rx="8" ry="12" fill="#a8c5a0" transform="rotate(-15 50 32)" />
      {/* Eyes */}
      <circle cx="43" cy="58" r="3.5" fill={eyeColor} />
      <circle cx="57" cy="58" r="3.5" fill={eyeColor} />
      {/* Mouth — changes with mood */}
      {mood === 'radiant' && (
        <path
          d="M44 67 Q50 72 56 67"
          stroke="#3d3d3d"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'calm' && (
        <path
          d="M45 67 Q50 70 55 67"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {(mood === 'restless' || mood === 'weary' || mood === 'fragile') && (
        <path
          d="M44 69 Q50 65 56 69"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'resting' && (
        <>
          <path d="M42 58 Q43 55 44 58" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path d="M56 58 Q57 55 58 58" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path
            d="M45 66 Q50 68 55 66"
            stroke="#3d3d3d"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ─── Sprout ───────────────────────────────────────────────────────────────────
function SproutAvatar({ mood }: AvatarProps): React.JSX.Element {
  const eyeColor = mood === 'resting' || mood === 'weary' ? '#c3aee0' : '#3d3d3d';
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      {/* Body */}
      <ellipse cx="50" cy="63" rx="30" ry="26" fill="#b8e0d2" />
      {/* Sprout on head */}
      <line
        x1="50"
        y1="37"
        x2="50"
        y2="28"
        stroke="#a8c5a0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="44" cy="26" rx="7" ry="10" fill="#a8c5a0" transform="rotate(-20 44 26)" />
      <ellipse cx="56" cy="25" rx="7" ry="10" fill="#a8c5a0" transform="rotate(20 56 25)" />
      {/* Eyes */}
      <circle cx="43" cy="61" r="3.5" fill={eyeColor} />
      <circle cx="57" cy="61" r="3.5" fill={eyeColor} />
      {mood === 'radiant' && (
        <path
          d="M44 70 Q50 75 56 70"
          stroke="#3d3d3d"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'calm' && (
        <path
          d="M45 70 Q50 73 55 70"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {(mood === 'restless' || mood === 'weary' || mood === 'fragile') && (
        <path
          d="M44 72 Q50 68 56 72"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'resting' && (
        <>
          <path d="M41 61 Q43 58 45 61" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path d="M55 61 Q57 58 59 61" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path
            d="M45 69 Q50 71 55 69"
            stroke="#3d3d3d"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ─── Bloom ────────────────────────────────────────────────────────────────────
function BloomAvatar({ mood }: AvatarProps): React.JSX.Element {
  const eyeColor = mood === 'resting' || mood === 'weary' ? '#c3aee0' : '#3d3d3d';
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      {/* Flower petals */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx={50 + 14 * Math.cos((angle * Math.PI) / 180)}
          cy={30 + 14 * Math.sin((angle * Math.PI) / 180)}
          rx="7"
          ry="10"
          fill="#f2c4a0"
          transform={`rotate(${angle} ${50 + 14 * Math.cos((angle * Math.PI) / 180)} ${30 + 14 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      {/* Flower center */}
      <circle cx="50" cy="30" r="8" fill="#c3aee0" />
      {/* Body */}
      <ellipse cx="50" cy="65" rx="30" ry="25" fill="#f2c4a0" />
      {/* Eyes */}
      <circle cx="43" cy="63" r="3.5" fill={eyeColor} />
      <circle cx="57" cy="63" r="3.5" fill={eyeColor} />
      {mood === 'radiant' && (
        <path
          d="M44 72 Q50 77 56 72"
          stroke="#3d3d3d"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'calm' && (
        <path
          d="M45 72 Q50 75 55 72"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {(mood === 'restless' || mood === 'weary' || mood === 'fragile') && (
        <path
          d="M44 74 Q50 70 56 74"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'resting' && (
        <>
          <path d="M41 63 Q43 60 45 63" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path d="M55 63 Q57 60 59 63" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path
            d="M45 71 Q50 73 55 71"
            stroke="#3d3d3d"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ─── Flourish ─────────────────────────────────────────────────────────────────
function FlourishAvatar({ mood }: AvatarProps): React.JSX.Element {
  const eyeColor = mood === 'resting' || mood === 'weary' ? '#c3aee0' : '#3d3d3d';
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full">
      {/* Radiating warmth glow */}
      <circle cx="50" cy="55" r="40" fill="#c3aee0" opacity="0.15" />
      {/* Body */}
      <ellipse cx="50" cy="60" rx="32" ry="28" fill="#c3aee0" />
      {/* Crown-like top */}
      {[35, 43, 50, 57, 65].map((x, i) => (
        <ellipse key={x} cx={x} cy={30} rx="5" ry={i === 2 ? 12 : 9} fill="#a8c5a0" />
      ))}
      {/* Eyes */}
      <circle cx="43" cy="58" r="4" fill={eyeColor} />
      <circle cx="57" cy="58" r="4" fill={eyeColor} />
      {/* Sparkle in eyes when radiant */}
      {mood === 'radiant' && (
        <>
          <circle cx="44.5" cy="56.5" r="1.2" fill="white" />
          <circle cx="58.5" cy="56.5" r="1.2" fill="white" />
          <path
            d="M44 68 Q50 74 56 68"
            stroke="#3d3d3d"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {mood === 'calm' && (
        <path
          d="M45 68 Q50 72 55 68"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {(mood === 'restless' || mood === 'weary' || mood === 'fragile') && (
        <path
          d="M44 70 Q50 66 56 70"
          stroke="#3d3d3d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'resting' && (
        <>
          <path d="M41 58 Q43 55 45 58" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path d="M55 58 Q57 55 59 58" stroke={eyeColor} strokeWidth="1.5" fill="none" />
          <path
            d="M45 67 Q50 69 55 67"
            stroke="#3d3d3d"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ─── Exported dispatcher ──────────────────────────────────────────────────────

interface CompanionAvatarProps {
  stage: CompanionStage;
  mood: CompanionMood;
}

export function CompanionAvatar({ stage, mood }: CompanionAvatarProps): React.JSX.Element {
  switch (stage) {
    case 'sprout':
      return <SproutAvatar mood={mood} />;
    case 'bloom':
      return <BloomAvatar mood={mood} />;
    case 'flourish':
      return <FlourishAvatar mood={mood} />;
    default:
      return <SeedlingAvatar mood={mood} />;
  }
}
