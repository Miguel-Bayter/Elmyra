import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@shared/ui/Modal';
import type { MoodEntry } from '@entities/companion';
import type { CompanionMood } from '@entities/companion';

type MoodScore = 1 | 2 | 3 | 4 | 5;

const MOOD_SCORES: MoodScore[] = [1, 2, 3, 4, 5];

const SCORE_BG: Record<MoodScore, string> = {
  1: 'bg-base-300',
  2: 'bg-base-300',
  3: 'bg-base-200',
  4: 'bg-secondary/20',
  5: 'bg-primary/20',
};

const SCORE_RING: Record<MoodScore, string> = {
  1: 'ring-base-content/30',
  2: 'ring-base-content/30',
  3: 'ring-base-content/30',
  4: 'ring-secondary',
  5: 'ring-primary',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: MoodEntry) => void;
  companionMood: CompanionMood;
  hasTodayEntry: boolean;
}

export function MoodCheckIn({
  isOpen,
  onClose,
  onSave,
  companionMood,
  hasTodayEntry,
}: Props): React.JSX.Element {
  const { t } = useTranslation('journal');
  const [selected, setSelected] = useState<MoodScore | null>(null);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!selected) return;
    const entry: MoodEntry = {
      date: new Date().toISOString().slice(0, 10),
      mood: selected,
      companionMood,
      ...(note.trim() ? { note: note.trim().slice(0, 140) } : {}),
    };
    onSave(entry);
    setSelected(null);
    setNote('');
    onClose();
  };

  const handleClose = () => {
    setSelected(null);
    setNote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={hasTodayEntry ? t('checkInDone') : t('checkIn')}
      closeLabel={t('cancel')}
    >
      <div className="flex flex-col gap-4">
        {/* Mood score buttons */}
        <div className="flex items-center justify-between gap-1.5">
          {MOOD_SCORES.map((score) => (
            <motion.button
              key={score}
              type="button"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              onClick={() => setSelected(score)}
              aria-label={t(`moods.${score}`)}
              aria-pressed={selected === score}
              className={clsx(
                'flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                selected === score
                  ? // eslint-disable-next-line security/detect-object-injection
                    clsx('ring-2', SCORE_RING[score], SCORE_BG[score])
                  : 'bg-base-200 hover:bg-base-300',
              )}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {t(`emojis.${score}`)}
              </span>
              <span className="text-nano font-medium text-base-content/70 leading-none">
                {t(`moods.${score}`)}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Optional note */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                className="textarea textarea-bordered w-full resize-none bg-base-200 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary"
                rows={2}
                maxLength={140}
                placeholder={t('notePlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-label={t('noteLabel')}
              />
              <div className="flex justify-end">
                <span className="text-nano text-base-content/40">{note.length}/140</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={selected === null}
          className="btn btn-primary btn-sm w-full disabled:opacity-40"
        >
          {t('save')}
        </button>
      </div>
    </Modal>
  );
}
