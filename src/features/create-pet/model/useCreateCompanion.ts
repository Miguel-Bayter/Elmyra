import { useState } from 'react';
import { companionNameSchema } from '@entities/companion';
import type { CompanionSpecies } from '@entities/companion';
import { useCompanionStore } from '@entities/companion/model/companionStore';
import { sanitizeCompanionName } from '@shared/lib/sanitize';

export interface CreateCompanionResult {
  // Step 1 — species selection
  selectedSpecies: CompanionSpecies | null;
  selectSpecies: (species: CompanionSpecies) => void;

  // Step 2 — naming
  nameInput: string;
  nameError: string | null;
  setNameInput: (value: string) => void;

  // Actions
  create: () => void;
  isDisabled: boolean;
}

export const useCreateCompanion = (): CreateCompanionResult => {
  const companion = useCompanionStore((state) => state.companion);
  const initializeCompanion = useCompanionStore((state) => state.initializeCompanion);

  const [selectedSpecies, setSelectedSpecies] = useState<CompanionSpecies | null>(null);
  const [nameInput, setNameInputRaw] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const selectSpecies = (species: CompanionSpecies) => {
    setSelectedSpecies(species);
  };

  const setNameInput = (value: string) => {
    setNameInputRaw(value);
    // Clear error on every keystroke — no persistent guilt (R7)
    if (nameError) setNameError(null);
  };

  const create = () => {
    if (!selectedSpecies) return;

    const sanitized = sanitizeCompanionName(nameInput);
    const result = companionNameSchema.safeParse(sanitized);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setNameError(firstIssue?.message ?? 'errors.nameInvalidChars');
      return;
    }

    setNameError(null);
    initializeCompanion(result.data, selectedSpecies);
  };

  return {
    selectedSpecies,
    selectSpecies,
    nameInput,
    nameError,
    setNameInput,
    create,
    // Disable if a companion already exists — creation is a one-time event
    isDisabled: companion !== null,
  };
};
