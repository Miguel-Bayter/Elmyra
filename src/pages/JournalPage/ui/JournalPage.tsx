import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useCompanionStore } from '@entities/companion';
import { AppLayout } from '@widgets/AppLayout';
import { useJournal, MoodCheckIn } from '@features/mood-journal';
import type { MoodEntry } from '@entities/companion';

type MoodScore = 1 | 2 | 3 | 4 | 5;

const MOOD_BAR_COLOR: Record<MoodScore, string> = {
  1: 'bg-base-300',
  2: 'bg-base-300',
  3: 'bg-warning/60',
  4: 'bg-secondary/70',
  5: 'bg-primary/70',
};

const MOOD_LABEL_COLOR: Record<MoodScore, string> = {
  1: 'text-base-content/40',
  2: 'text-base-content/40',
  3: 'text-warning',
  4: 'text-secondary',
  5: 'text-primary',
};

function dateLabel(dateStr: string, t: (key: string) => string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (dateStr === today) return t('today');
  if (dateStr === yesterday) return t('yesterday');
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  return t('daysAgo').replace('{{count}}', String(diff));
}

function TrendChart({ entries }: { entries: MoodEntry[] }): React.JSX.Element {
  const last7 = entries.slice(0, 7).reverse();
  return (
    <div className="flex items-end gap-1.5 h-10">
      {last7.map((e) => {
        const score = e.mood as MoodScore;
        const heightPct = (score / 5) * 100;
        return (
          <motion.div
            key={e.date}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${heightPct}%`, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            // eslint-disable-next-line security/detect-object-injection
            className={clsx('flex-1 rounded-full min-h-1', MOOD_BAR_COLOR[score])}
          />
        );
      })}
    </div>
  );
}

function EntryCard({
  entry,
  companionName,
  t,
}: {
  entry: MoodEntry;
  companionName: string;
  t: (key: string, opts?: Record<string, string>) => string;
}): React.JSX.Element {
  const score = entry.mood as MoodScore;
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-base-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none" aria-hidden="true">
          {['😔', '😟', '😐', '😊', '🌟'][entry.mood - 1]}
        </span>
        {/* eslint-disable-next-line security/detect-object-injection */}
        <span className={clsx('text-sm font-medium', MOOD_LABEL_COLOR[score])}>
          {t(`moods.${entry.mood}`)}
        </span>
        <span className="ml-auto text-nano text-base-content/40">{dateLabel(entry.date, t)}</span>
      </div>
      {entry.note && <p className="text-xs text-base-content/70 leading-relaxed">{entry.note}</p>}
      <p className="text-nano text-base-content/30">
        {t('companionFelt', { name: companionName, mood: entry.companionMood })}
      </p>
    </div>
  );
}

export function JournalPage(): React.JSX.Element {
  const { t } = useTranslation('journal');
  const navigate = useNavigate();
  const companion = useCompanionStore((s) => s.companion);
  const { entries, addEntry, hasTodayEntry } = useJournal();
  const [showCheckIn, setShowCheckIn] = useState(false);

  const companionName = companion?.name ?? '';
  const companionMood = companion?.mood ?? 'calm';

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
            <p className="text-nano text-base-content/40">{t('subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCheckIn(true)}
            className={clsx(
              'btn btn-sm ml-auto',
              hasTodayEntry ? 'btn-ghost text-base-content/40' : 'btn-primary',
            )}
          >
            {hasTodayEntry ? '✓' : '+'}
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-base-100 px-4 py-4 sm:rounded-b-3xl">
          {/* 7-day trend */}
          {entries.length > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl bg-base-200 px-4 py-3">
              <p className="text-nano font-medium uppercase tracking-wider text-base-content/40">
                {t('trendLabel')}
              </p>
              <TrendChart entries={entries} />
            </div>
          )}

          {/* Entry list */}
          <div className="flex flex-col gap-2">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <span className="text-4xl" aria-hidden="true">
                  📖
                </span>
                <p className="text-sm font-medium text-base-content/60">{t('historyEmpty')}</p>
                <p className="text-nano text-base-content/40">{t('historyEmptyHint')}</p>
              </div>
            ) : (
              entries.map((entry) => (
                <EntryCard
                  key={entry.date}
                  entry={entry}
                  companionName={companionName}
                  t={t as (key: string, opts?: Record<string, string>) => string}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <MoodCheckIn
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSave={addEntry}
        companionMood={companionMood}
        hasTodayEntry={hasTodayEntry}
      />
    </AppLayout>
  );
}
