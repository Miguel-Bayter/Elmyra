import { useState } from 'react';
import { companionNameSchema } from '@entities/companion';
import { useCompanionStore } from '@entities/companion/model/companionStore';
import { sanitizeCompanionName } from '@shared/lib/sanitize';

export interface RenameCompanionResult {
  nameInput: string;
  nameError: string | null;
  setNameInput: (value: string) => void;
  rename: () => void;
  isDisabled: boolean;
}

export const useRenameCompanion = (): RenameCompanionResult => {
  const companion = useCompanionStore((state) => state.companion);
  const renameCompanion = useCompanionStore((state) => state.renameCompanion);

  const [nameInput, setNameInputRaw] = useState(companion?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);

  const setNameInput = (value: string) => {
    setNameInputRaw(value);
    if (nameError) setNameError(null);
  };

  const rename = () => {
    const sanitized = sanitizeCompanionName(nameInput);
    const result = companionNameSchema.safeParse(sanitized);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setNameError(firstIssue?.message ?? 'errors.nameInvalidChars');
      return;
    }

    setNameError(null);
    renameCompanion(result.data);
  };

  return {
    nameInput,
    nameError,
    setNameInput,
    rename,
    isDisabled: !companion,
  };
};
