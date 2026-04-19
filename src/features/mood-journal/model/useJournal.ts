import { useState, useCallback } from 'react';
import { journalSchema } from '@entities/companion';
import type { MoodEntry, Journal } from '@entities/companion';

const STORAGE_KEY = 'elmyra_journal';
const MAX_ENTRIES = 90;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): Journal {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return journalSchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

function persist(entries: Journal): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useJournal() {
  const [entries, setEntries] = useState<Journal>(load);

  const hasTodayEntry = entries[0]?.date === todayISO();

  const addEntry = useCallback((entry: MoodEntry) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== entry.date);
      const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
  }, []);

  return { entries, addEntry, hasTodayEntry };
}
