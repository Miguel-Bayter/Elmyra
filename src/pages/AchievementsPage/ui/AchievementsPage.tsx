import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useCompanionStore } from '@entities/companion';
import { AppLayout } from '@widgets/AppLayout';
import { useJournal } from '@features/mood-journal';
import { useAchievements, getBreathingCount } from '@features/achievements';

export function AchievementsPage(): React.JSX.Element {
  const { t } = useTranslation('achievements');
  const navigate = useNavigate();
  const companion = useCompanionStore((s) => s.companion);
  const streak = useCompanionStore((s) => s.streak);
  const { entries } = useJournal();

  const { achievements } = useAchievements({
    companion,
    streak,
    journalEntries: entries,
    breathingCount: getBreathingCount(),
  });

  const companionName = companion?.name ?? '';
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <AppLayout>
      <div className="flex h-[calc(100dvh-52px)] w-full max-w-sm flex-col overflow-hidden sm:my-4 sm:h-auto sm:max-h-[720px] sm:rounded-3xl sm:shadow-2xl sm:shadow-base-content/10">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3 sm:rounded-t-3xl">
          <button
            type="button"
            onClick={() => void navigate('/companion')}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={t('backToCompanion')}
          >
            ←
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-base-content">{t('title')}</h1>
            {companionName && (
              <p className="text-nano text-base-content/40">
                {t('subtitle', { name: companionName })}
              </p>
            )}
          </div>
          <span className="ml-auto text-nano text-base-content/40">
            {unlockedCount}/{achievements.length}
          </span>
        </div>

        {/* Badge grid */}
        <div className="flex-1 overflow-y-auto bg-base-100 px-4 py-4 sm:rounded-b-3xl">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className={clsx(
                  'flex flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center transition-colors duration-200',
                  achievement.unlocked
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-base-200 border border-base-300',
                )}
              >
                <span
                  className={clsx(
                    'text-3xl leading-none',
                    !achievement.unlocked && 'opacity-30 grayscale',
                  )}
                  aria-hidden="true"
                >
                  {achievement.emoji}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span
                    className={clsx(
                      'text-xs font-medium leading-tight',
                      achievement.unlocked ? 'text-base-content' : 'text-base-content/40',
                    )}
                  >
                    {t(`badges.${achievement.id}.name`)}
                  </span>
                  <span className="text-nano leading-snug text-base-content/40">
                    {achievement.unlocked && achievement.unlockedAt
                      ? t('unlockedOn', {
                          date: new Date(achievement.unlockedAt).toLocaleDateString(),
                        })
                      : t(`badges.${achievement.id}.description`)}
                  </span>
                </div>
                {achievement.unlocked && (
                  <span className="badge badge-primary badge-sm font-normal">✓</span>
                )}
                {!achievement.unlocked && (
                  <span className="badge badge-ghost badge-sm font-normal text-base-content/30">
                    {t('locked')}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
