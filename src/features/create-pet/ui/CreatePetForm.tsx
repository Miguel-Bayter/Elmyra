import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/ui/Button';
import { useCreateCompanion } from '../model/useCreateCompanion';

// Maps Zod error message keys (from schemas.ts) to errors namespace keys.
const ERROR_KEY_MAP: Record<string, 'nameRequired' | 'nameTooLong' | 'nameInvalidChars'> = {
  'errors.nameRequired': 'nameRequired',
  'errors.nameTooLong': 'nameTooLong',
  'errors.nameInvalidChars': 'nameInvalidChars',
};

export function CreatePetForm(): React.JSX.Element {
  const { t } = useTranslation(['common', 'errors']);
  const { nameInput, nameError, setNameInput, create, isDisabled } = useCreateCompanion();

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Card surface — slightly elevated from background */}
      <div className="border-lavender-card rounded-3xl bg-parchment p-6 shadow-lg shadow-ink/5">
        <label
          htmlFor="companion-name"
          className="mb-2 block text-sm font-medium text-ink-secondary"
        >
          {t('companionNameLabel', { ns: 'common' })}
        </label>

        <input
          id="companion-name"
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') create();
          }}
          placeholder={t('companionNamePlaceholder', { ns: 'common' })}
          maxLength={24}
          disabled={isDisabled}
          aria-describedby={nameError ? 'name-error' : undefined}
          aria-invalid={nameError !== null}
          className="border-card w-full rounded-2xl bg-parchment-warm px-4 py-3 text-base text-ink placeholder:text-ink-faint transition-all focus:outline-none focus:ring-2 focus:ring-lavender/50 disabled:opacity-50"
        />

        {nameError && (
          <p id="name-error" role="alert" className="mt-2 text-sm text-warm-peach">
            {/* Safe: nameError values come from a closed set in schemas.ts */}
            {/* eslint-disable-next-line security/detect-object-injection */}
            {t(ERROR_KEY_MAP[nameError] ?? 'nameInvalidChars', { ns: 'errors' })}
          </p>
        )}
      </div>

      <Button
        onClick={create}
        label={t('createCompanion', { ns: 'common' })}
        isDisabled={isDisabled || nameInput.trim().length === 0}
        variant="primary"
        size="lg"
      />
    </div>
  );
}
