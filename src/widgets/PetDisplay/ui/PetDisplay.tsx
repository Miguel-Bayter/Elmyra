import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import { useCompanionStore } from '@entities/companion';
import { useToastStore } from '@shared/ui/Toast';
import type {
  ActionType,
  CompanionMood,
  CompanionSpecies,
  CompanionStage,
} from '@entities/companion';
import { CompanionAvatar } from './CompanionAvatar';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  /** Current affirmation text — renders as a speech bubble above the companion */
  speechBubble?: string;
  /** Last user action — triggers floating emoji burst from companion */
  reaction?: { action: ActionType; key: number } | null;
  /** Hides the age/support message to save vertical space */
  compact?: boolean;
}

// ─── Reaction emoji particles ─────────────────────────────────────────────────
const ACTION_EMOJI: Record<ActionType, string> = {
  nourish: '🍃',
  play: '✨',
  rest: '🌙',
  comfort: '💜',
};

const PARTICLE_X_OFFSETS = [-30, 2, 28] as const;

// ─── Mood → ambient glow ring ─────────────────────────────────────────────────
const MOOD_RING: Record<CompanionMood, string> = {
  radiant: 'bg-lavender-mist',
  calm: 'bg-mint-mist',
  restless: 'bg-peach-mist',
  weary: 'bg-parchment-deep',
  fragile: 'bg-peach-mist',
  resting: 'bg-lavender-mist',
};

// ─── Mood → small dot color on the mood chip ─────────────────────────────────
const MOOD_DOT: Record<CompanionMood, string> = {
  radiant: 'bg-lavender',
  calm: 'bg-sage',
  restless: 'bg-warm-peach',
  weary: 'bg-ink-faint',
  fragile: 'bg-warm-peach',
  resting: 'bg-soft-mint',
};

// ─── S4-FE-01: Framer Motion mood animations ─────────────────────────────────
const MOOD_ANIMATION: Record<CompanionMood, TargetAndTransition> = {
  radiant: {
    y: [0, -8, 0],
    scale: [1, 1.02, 1],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  calm: {
    y: [0, -5, 0],
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
  restless: {
    x: [-3, 3, -3],
    transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' },
  },
  weary: {
    scale: [1, 0.98, 1],
    transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
  },
  fragile: {
    y: [0, -2, 0],
    transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
  },
  resting: {
    scale: [1, 1.03, 1],
    opacity: [1, 0.85, 1],
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
};

// ─── Evolution stage level (Roman numerals) ───────────────────────────────────
const STAGE_LEVEL: Record<CompanionStage, string> = {
  seedling: 'I',
  sprout: 'II',
  bloom: 'III',
  flourish: 'IV',
};

// ─── Species → stage chip colors ─────────────────────────────────────────────
interface ChipTheme {
  bg: string;
  text: string;
  level: string;
}

const SPECIES_CHIP: Record<CompanionSpecies, ChipTheme> = {
  zephyr: { bg: 'bg-mint-mist', text: 'text-sage-dark', level: 'text-soft-mint' },
  kova: { bg: 'bg-parchment-deep', text: 'text-ink-secondary', level: 'text-ink-muted' },
  luma: { bg: 'bg-golden-mist', text: 'text-golden-dark', level: 'text-golden' },
  maru: { bg: 'bg-lavender-light', text: 'text-lavender-dark', level: 'text-lavender' },
};

export function PetDisplay({ speechBubble, reaction, compact }: Props): React.JSX.Element | null {
  const { t } = useTranslation(['pet', 'common', 'notifications']);
  const showToast = useToastStore((s) => s.showToast);

  const name = useCompanionStore((s) => s.companion?.name);
  const species = useCompanionStore((s) => s.companion?.species);
  const stage = useCompanionStore((s) => s.companion?.stage);
  const mood = useCompanionStore((s) => s.companion?.mood);
  const createdAt = useCompanionStore((s) => s.companion?.createdAt);
  const isResting = useCompanionStore((s) => s.companion?.isResting);

  // ─── Real-time clock — refreshes display every 60 s ──────────────────────
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // ─── S4-FE-02: Stage evolution toast ─────────────────────────────────────
  const prevStageRef = useRef<CompanionStage | undefined>(undefined);
  useEffect(() => {
    if (!stage || !name || !species) return;
    if (prevStageRef.current !== undefined && prevStageRef.current !== stage) {
      const stageName = t(`species.${species}.stages.${stage}`, { ns: 'common' });
      showToast(t('stageEvolved', { ns: 'notifications', name, stage: stageName }), 'celebration');
    }
    prevStageRef.current = stage;
  }, [stage, name, species, showToast, t]);

  if (!name || !species || !stage || !mood || !createdAt) return null;

  // Safe: mood, species, stage are typed union values, never user-supplied strings
  // eslint-disable-next-line security/detect-object-injection
  const ringClass = MOOD_RING[mood] ?? 'bg-lavender-mist';
  // eslint-disable-next-line security/detect-object-injection
  const dotClass = MOOD_DOT[mood] ?? 'bg-ink-faint';
  // eslint-disable-next-line security/detect-object-injection
  const chipTheme = SPECIES_CHIP[species];
  // eslint-disable-next-line security/detect-object-injection
  const levelLabel = STAGE_LEVEL[stage];

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // eslint-disable-next-line security/detect-object-injection
  const moodAnimation = prefersReducedMotion ? {} : MOOD_ANIMATION[mood];

  // Elapsed real time — formatted to nearest meaningful unit
  const elapsedMs = now - new Date(createdAt).getTime();
  const elDays = Math.floor(elapsedMs / 86_400_000);
  const elHours = Math.floor((elapsedMs % 86_400_000) / 3_600_000);
  const elMinutes = Math.floor((elapsedMs % 3_600_000) / 60_000);
  let duration: string;
  if (elapsedMs < 60_000) duration = t('ageRealtime.lessThanMinute', { ns: 'pet' });
  else if (elDays > 0)
    duration = t('ageRealtime.days', { ns: 'pet', days: elDays, hours: elHours });
  else if (elHours > 0)
    duration = t('ageRealtime.hours', { ns: 'pet', hours: elHours, minutes: elMinutes });
  else duration = t('ageRealtime.minutes', { ns: 'pet', minutes: elMinutes });
  const elapsedDays = elDays;
  const supportMessages = t('ageSupport', { ns: 'pet', returnObjects: true }) as string[];
  const supportMsg =
    supportMessages.length > 0 ? (supportMessages[elapsedDays % supportMessages.length] ?? '') : '';

  return (
    <div className="flex flex-col items-center gap-1.5 pt-1 pb-2">
      {/* ── Speech bubble — sits directly above companion, no reserved height ── */}
      <AnimatePresence mode="wait">
        {speechBubble && (
          <motion.div
            key={speechBubble.slice(0, 20)}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative px-4"
          >
            <div className="relative max-w-[240px] rounded-2xl rounded-bl-sm bg-lavender-light px-4 py-2.5 shadow-sm">
              <p className="text-sm italic leading-snug text-ink-secondary">
                &ldquo;{speechBubble}&rdquo;
              </p>
              {/* Bubble tail — CSS triangle pointing down-left toward companion */}
              <div className="absolute -bottom-[8px] left-5 h-0 w-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent border-t-lavender-light" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Companion with ambient glow ring + reaction particles ────────── */}
      <div className="relative mt-1">
        <div
          className={`absolute inset-0 -m-4 rounded-full ${ringClass} blur-xl opacity-70`}
          aria-hidden="true"
        />
        <motion.div
          className="relative h-40 w-40"
          animate={moodAnimation}
          aria-label={`${name}, ${t(`moods.${mood}`, { ns: 'pet' })}`}
        >
          <CompanionAvatar
            species={species}
            stage={stage}
            mood={mood}
            {...(reaction != null && { reactionKey: reaction.key })}
          />
        </motion.div>

        {/* Floating emoji particles — burst upward on each action */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <AnimatePresence>
            {reaction &&
              PARTICLE_X_OFFSETS.map((xOff, i) => (
                <motion.span
                  key={`${reaction.key}-${i}`}
                  className="absolute bottom-1/2 text-xl"
                  initial={{ y: 0, x: xOff, opacity: 1, scale: 0.7 }}
                  animate={{ y: -80, opacity: 0, scale: 1.3 }}
                  exit={{}}
                  transition={{ duration: 0.85, delay: i * 0.09, ease: 'easeOut' }}
                >
                  {ACTION_EMOJI[reaction.action]}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Name ─────────────────────────────────────────────────────────── */}
      <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">{name}</h2>

      {/* ── Evolution stage + mood chips ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span
          className={clsx('badge gap-1.5 font-semibold', chipTheme.bg, chipTheme.text)}
          aria-label={`${t('stageLevelLabel', { ns: 'pet' })} ${levelLabel}: ${t(`species.${species}.stages.${stage}`, { ns: 'common' })}`}
        >
          <span className={clsx('font-bold', chipTheme.level)} aria-hidden="true">
            {levelLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t(`species.${species}.stages.${stage}`, { ns: 'common' })}</span>
        </span>

        <span
          className="badge bg-parchment-deep text-ink-secondary gap-1.5 font-medium"
          aria-label={`${t('moodLabel', { ns: 'pet' })}: ${t(`moods.${mood}`, { ns: 'pet' })}`}
        >
          <span
            className={clsx('h-1.5 w-1.5 rounded-full flex-shrink-0', dotClass)}
            aria-hidden="true"
          />
          {t(`moods.${mood}`, { ns: 'pet' })}
        </span>
      </div>

      {/* ── Real-time age + support message ──────────────────────────────── */}
      {!compact && (
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-medium text-ink-muted">
            {duration} {t('ageRealtime.together', { ns: 'pet' })}
          </p>
          <p className="text-xs text-ink-faint italic">{supportMsg}</p>
        </div>
      )}

      {/* ── Resting indicator ─────────────────────────────────────────────── */}
      {isResting && (
        <span className="badge bg-mint-mist text-sage-dark font-medium px-4 py-3">
          {t('isResting', { ns: 'pet' })}
        </span>
      )}
    </div>
  );
}
