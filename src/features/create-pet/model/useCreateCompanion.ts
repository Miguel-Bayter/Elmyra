import { useState } from 'react';
import { companionNameSchema } from '@entities/companion';
import { useCompanionStore } from '@entities/companion/model/companionStore';
import { sanitizeCompanionName } from '@shared/lib/sanitize';

export interface CreateCompanionResult {
  nameInput: string;
  nameError: string | null;
  setNameInput: (value: string) => void;
  create: () => void;
  isDisabled: boolean;
}

export const useCreateCompanion = (): CreateCompanionResult => {
  const companion = useCompanionStore((state) => state.companion);
  const initializeCompanion = useCompanionStore((state) => state.initializeCompanion);

  const [nameInput, setNameInputRaw] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const setNameInput = (value: string) => {
    setNameInputRaw(value);
    // Clear error on every keystroke — no persistent guilt (R7)
    if (nameError) setNameError(null);
  };

  const create = () => {
    const sanitized = sanitizeCompanionName(nameInput);
    const result = companionNameSchema.safeParse(sanitized);

    if (!result.success) {
      // Use first error message key — TypeScript-typed i18n keys (R2)
      const firstIssue = result.error.issues[0];
      setNameError(firstIssue?.message ?? 'errors.nameInvalidChars');
      return;
    }

    setNameError(null);
    initializeCompanion(result.data);
  };

  return {
    nameInput,
    nameError,
    setNameInput,
    create,
    // Disable if a companion already exists — creation is a one-time event
    isDisabled: companion !== null,
  };
};
