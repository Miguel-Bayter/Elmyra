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

interface Props {
  speechBubble?: string;
  reaction?: { action: ActionType; key: number } | null;
  compact?: boolean;
}

const ACTION_EMOJI: Record<ActionType, string> = {
  nourish: '🍃',
  play: '✨',
  rest: '🌙',
  comfort: '💜',
};

const PARTICLE_X_OFFSETS = [-28, 0, 26] as const;

const MOOD_RING: Record<CompanionMood, string> = {
  radiant: 'bg-lavender-mist',
  calm: 'bg-mint-mist',
  restless: 'bg-peach-mist',
  weary: 'bg-parchment-deep',
  fragile: 'bg-peach-mist',
  resting: 'bg-lavender-mist',
};

const MOOD_DOT: Record<CompanionMood, string> = {
  radiant: 'bg-lavender',
  calm: 'bg-sage',
  restless: 'bg-warm-peach',
  weary: 'bg-ink-faint',
  fragile: 'bg-warm-peach',
  resting: 'bg-soft-mint',
};

const MOOD_ANIMATION: Record<CompanionMood, TargetAndTransition> = {
  radiant: {
    y: [0, -7, 0],
    scale: [1, 1.02, 1],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  calm: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' } },
  restless: { x: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' } },
  weary: { scale: [1, 0.98, 1], transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' } },
  fragile: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' } },
  resting: {
    scale: [1, 1.03, 1],
    opacity: [1, 0.85, 1],
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
};

const STAGE_LEVEL: Record<CompanionStage, string> = {
  seedling: 'I',
  sprout: 'II',
  bloom: 'III',
  flourish: 'IV',
};

interface ChipTheme {
  bg: string;
  text: string;
  level: string;
}
const SPECIES_CHIP: Record<CompanionSpecies, ChipTheme> = {
  // 3D species
  zephyr: { bg: 'bg-mint-mist', text: 'text-sage-dark', level: 'text-soft-mint' },
  kova: { bg: 'bg-parchment-deep', text: 'text-ink-secondary', level: 'text-ink-muted' },
  luma: { bg: 'bg-golden-mist', text: 'text-golden-dark', level: 'text-golden' },
  maru: { bg: 'bg-lavender-light', text: 'text-lavender-dark', level: 'text-lavender' },
  // 2D kawaii species
  nimbus: { bg: 'bg-lavender-mist', text: 'text-lavender-dark', level: 'text-lavender' },
  boba: { bg: 'bg-mint-mist', text: 'text-sage-dark', level: 'text-soft-mint' },
  mochi: { bg: 'bg-peach-mist', text: 'text-ink-secondary', level: 'text-warm-peach' },
  nuri: { bg: 'bg-sage-mist', text: 'text-sage-dark', level: 'text-sage' },
};

type AgeBadgeKey =
  | 'ageBadgeMessage.justNow'
  | 'ageBadgeMessage.minutes'
  | 'ageBadgeMessage.hours'
  | 'ageBadgeMessage.oneDay'
  | 'ageBadgeMessage.days'
  | 'ageBadgeMessage.weeks'
  | 'ageBadgeMessage.months'
  | 'ageBadgeMessage.manyMonths'
  | 'ageBadgeMessage.year';

export function PetDisplay({ speechBubble, reaction, compact }: Props): React.JSX.Element | null {
  const { t } = useTranslation(['pet', 'common', 'notifications']);
  const showToast = useToastStore((s) => s.showToast);

  const name = useCompanionStore((s) => s.companion?.name);
  const species = useCompanionStore((s) => s.companion?.species);
  const stage = useCompanionStore((s) => s.companion?.stage);
  const mood = useCompanionStore((s) => s.companion?.mood);
  const createdAt = useCompanionStore((s) => s.companion?.createdAt);
  const isResting = useCompanionStore((s) => s.companion?.isResting);
  const streakCount = useCompanionStore((s) => s.streak.count);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

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

  // Age computation
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

  let ageBadgeKey: AgeBadgeKey;
  if (elapsedMs < 60_000) ageBadgeKey = 'ageBadgeMessage.justNow';
  else if (elDays === 0 && elHours === 0) ageBadgeKey = 'ageBadgeMessage.minutes';
  else if (elDays === 0) ageBadgeKey = 'ageBadgeMessage.hours';
  else if (elDays === 1) ageBadgeKey = 'ageBadgeMessage.oneDay';
  else if (elDays < 7) ageBadgeKey = 'ageBadgeMessage.days';
  else if (elDays < 30) ageBadgeKey = 'ageBadgeMessage.weeks';
  else if (elDays < 90) ageBadgeKey = 'ageBadgeMessage.months';
  else if (elDays < 365) ageBadgeKey = 'ageBadgeMessage.manyMonths';
  else ageBadgeKey = 'ageBadgeMessage.year';
  const ageBadgeMsg = t(ageBadgeKey, { ns: 'pet' });

  return (
    <div className="flex w-full flex-col items-center gap-1">
      {/* ── Speech bubble ── */}
      <AnimatePresence mode="wait">
        {speechBubble && (
          <motion.div
            key={speechBubble.slice(0, 20)}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="px-4"
          >
            <div className="relative max-w-[200px] rounded-2xl rounded-bl-sm bg-parchment-warm border border-lavender/20 px-3 py-2 shadow-sm sm:max-w-[260px]">
              <p className="line-clamp-2 text-xs leading-snug text-ink-secondary">{speechBubble}</p>
              <div className="absolute -bottom-[7px] left-4 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-parchment-warm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Companion + glow ring ── */}
      <div className="relative mt-1">
        <div
          className={`absolute inset-0 -m-3 rounded-full ${ringClass} blur-xl opacity-60`}
          aria-hidden="true"
        />
        <motion.div
          className="relative h-44 w-44"
          animate={moodAnimation}
          aria-label={`${name}, ${t(`moods.${mood}`, { ns: 'pet' })}`}
        >
          <CompanionAvatar
            species={species}
            stage={stage}
            mood={mood}
            size={176}
            {...(reaction != null && { reactionKey: reaction.key })}
          />
        </motion.div>

        {/* Reaction particles */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <AnimatePresence>
            {reaction &&
              PARTICLE_X_OFFSETS.map((xOff, i) => (
                <motion.span
                  key={`${reaction.key}-${i}`}
                  className="absolute bottom-1/2 text-lg"
                  initial={{ y: 0, x: xOff, opacity: 1, scale: 0.7 }}
                  animate={{ y: -70, opacity: 0, scale: 1.2 }}
                  exit={{}}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                >
                  {ACTION_EMOJI[reaction.action]}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Name ── */}
      <h2 className="mt-0.5 text-lg font-light tracking-wide leading-tight text-ink">{name}</h2>

      {/* ── Stage + mood + streak chips ── */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <span
          className={clsx('badge badge-sm gap-1 font-normal', chipTheme.bg, chipTheme.text)}
          aria-label={`${t('stageLevelLabel', { ns: 'pet' })} ${levelLabel}: ${t(`species.${species}.stages.${stage}`, { ns: 'common' })}`}
        >
          <span className={clsx('font-medium text-nano', chipTheme.level)} aria-hidden="true">
            {levelLabel}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>{t(`species.${species}.stages.${stage}`, { ns: 'common' })}</span>
        </span>

        <span
          className="badge badge-sm bg-parchment-deep text-ink-secondary gap-1 font-medium"
          aria-label={`${t('moodLabel', { ns: 'pet' })}: ${t(`moods.${mood}`, { ns: 'pet' })}`}
        >
          <span
            className={clsx('h-1.5 w-1.5 rounded-full flex-shrink-0', dotClass)}
            aria-hidden="true"
          />
          {t(`moods.${mood}`, { ns: 'pet' })}
        </span>

        {streakCount >= 2 && (
          <span
            className="badge badge-sm bg-golden-mist text-golden-dark font-medium gap-1 px-2"
            aria-label={t('streak.badge', { ns: 'pet', count: streakCount })}
          >
            <span aria-hidden="true" className="text-tiny">
              🔥
            </span>
            {streakCount}d
          </span>
        )}
      </div>

      {/* ── Age badge + comfort message — hidden in compact mode ── */}
      {!compact && (
        <div className="flex items-center gap-2">
          <span className="badge badge-sm bg-parchment-deep text-ink-muted gap-1 font-medium">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-2.5 w-2.5 shrink-0 opacity-50"
            >
              <path
                fillRule="evenodd"
                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3Zm.75 2.25a.75.75 0 0 0-1.5 0V8c0 .199.079.390.22.530l2 2a.75.75 0 1 0 1.06-1.06L8.75 7.689V5.25Z"
                clipRule="evenodd"
              />
            </svg>
            {duration}
          </span>
          <span className="text-tiny italic text-ink-muted">{ageBadgeMsg}</span>
        </div>
      )}

      {/* ── Resting indicator ── */}
      {isResting && (
        <span className="badge badge-sm bg-mint-mist text-sage-dark font-medium px-3">
          {t('isResting', { ns: 'pet' })}
        </span>
      )}

      {/* ── Support message — only when not compact ── */}
      {!compact && (
        <p className="text-xs text-ink-faint italic text-center px-6 mt-1">
          {(() => {
            const msgs = t('ageSupport', { ns: 'pet', returnObjects: true }) as string[];
            return msgs.length > 0 ? (msgs[elDays % msgs.length] ?? '') : '';
          })()}
        </p>
      )}
    </div>
  );
}
