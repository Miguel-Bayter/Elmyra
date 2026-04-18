import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Button } from '@shared/ui/Button';
import type { CompanionSpecies } from '@entities/companion';
import { CompanionAvatar, KawaiiAvatar } from '@entities/companion';
import { useCreateCompanion } from '../model/useCreateCompanion';

// ─── Maps Zod error keys → i18n error namespace keys ─────────────────────────
const ERROR_KEY_MAP: Record<string, 'nameRequired' | 'nameTooLong' | 'nameInvalidChars'> = {
  'errors.nameRequired': 'nameRequired',
  'errors.nameTooLong': 'nameTooLong',
  'errors.nameInvalidChars': 'nameInvalidChars',
};

const SPECIES_3D: CompanionSpecies[] = ['zephyr', 'kova', 'luma', 'maru'];
const SPECIES_2D: CompanionSpecies[] = ['nimbus', 'boba', 'mochi', 'nuri'];

// ─── Per-species visual theme — no inline styles (R3) ────────────────────────
interface SpeciesTheme {
  cardBg: string;
  ring: string;
  tagline: string;
  checkBg: string;
  descBg: string;
  descBorder: string;
}

const SPECIES_THEME: Record<CompanionSpecies, SpeciesTheme> = {
  // 3D species
  zephyr: {
    cardBg: 'bg-mint-mist',
    ring: 'ring-soft-mint',
    tagline: 'text-sage-dark',
    checkBg: 'bg-soft-mint',
    descBg: 'bg-mint-mist',
    descBorder: 'border-card',
  },
  kova: {
    cardBg: 'bg-parchment-deep',
    ring: 'ring-warm-peach',
    tagline: 'text-ink-secondary',
    checkBg: 'bg-warm-peach',
    descBg: 'bg-parchment-deep',
    descBorder: 'border-card',
  },
  luma: {
    cardBg: 'bg-golden-mist',
    ring: 'ring-golden',
    tagline: 'text-golden-dark',
    checkBg: 'bg-golden',
    descBg: 'bg-golden-mist',
    descBorder: 'border-card',
  },
  maru: {
    cardBg: 'bg-lavender-mist',
    ring: 'ring-lavender',
    tagline: 'text-lavender-dark',
    checkBg: 'bg-lavender',
    descBg: 'bg-lavender-mist',
    descBorder: 'border-lavender-card',
  },
  // 2D kawaii species
  nimbus: {
    cardBg: 'bg-lavender-mist',
    ring: 'ring-lavender',
    tagline: 'text-lavender-dark',
    checkBg: 'bg-lavender',
    descBg: 'bg-lavender-mist',
    descBorder: 'border-lavender-card',
  },
  boba: {
    cardBg: 'bg-mint-mist',
    ring: 'ring-soft-mint',
    tagline: 'text-sage-dark',
    checkBg: 'bg-soft-mint',
    descBg: 'bg-mint-mist',
    descBorder: 'border-card',
  },
  mochi: {
    cardBg: 'bg-peach-mist',
    ring: 'ring-warm-peach',
    tagline: 'text-ink-secondary',
    checkBg: 'bg-warm-peach',
    descBg: 'bg-peach-mist',
    descBorder: 'border-card',
  },
  nuri: {
    cardBg: 'bg-sage-mist',
    ring: 'ring-sage',
    tagline: 'text-sage-dark',
    checkBg: 'bg-sage',
    descBg: 'bg-sage-mist',
    descBorder: 'border-card',
  },
};

// ─── Step 0: style selection (3D vs 2D) ──────────────────────────────────────

type AvatarStyle = '3d' | '2d';

interface StyleCardProps {
  kind: AvatarStyle;
  isSelected: boolean;
  onSelect: () => void;
}

function StyleCard({ kind, isSelected, onSelect }: StyleCardProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const is3D = kind === '3d';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={clsx(
        'flex flex-col items-center gap-3 rounded-2xl p-4 text-center',
        'transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-2',
        is3D ? 'bg-parchment-deep' : 'bg-lavender-mist',
        isSelected
          ? 'ring-2 ring-lavender ring-offset-2 shadow-md scale-[1.02]'
          : 'ring-1 ring-transparent shadow-sm hover:shadow-md hover:scale-[1.01]',
      )}
    >
      {/* Preview avatar */}
      <div className="h-20 w-20 flex items-center justify-center" aria-hidden="true">
        {is3D ? (
          <CompanionAvatar species="zephyr" stage="seedling" mood="calm" size={80} />
        ) : (
          <KawaiiAvatar species="nimbus" stage="seedling" mood="calm" size={80} />
        )}
      </div>

      <div className="space-y-0.5">
        <p className="text-sm font-bold text-ink">{t(`styleSelect.${kind}`)}</p>
        <p className="text-xs text-ink-muted leading-snug">{t(`styleSelect.${kind}Desc`)}</p>
      </div>

      {isSelected && (
        <span className="badge badge-sm bg-lavender text-white border-0 font-semibold">✓</span>
      )}
    </button>
  );
}

interface StepStyleProps {
  selected: AvatarStyle | null;
  onSelect: (s: AvatarStyle) => void;
  onContinue: () => void;
}

function StepStyle({ selected, onSelect, onContinue }: StepStyleProps): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{t('styleSelect.title')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('styleSelect.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StyleCard kind="3d" isSelected={selected === '3d'} onSelect={() => onSelect('3d')} />
        <StyleCard kind="2d" isSelected={selected === '2d'} onSelect={() => onSelect('2d')} />
      </div>

      <Button
        onClick={onContinue}
        label={t('speciesSelect.continue')}
        isDisabled={selected === null}
        variant="primary"
        size="lg"
      />
    </div>
  );
}

// ─── Species selection card ───────────────────────────────────────────────────

interface SpeciesCardProps {
  species: CompanionSpecies;
  isSelected: boolean;
  onSelect: () => void;
}

function SpeciesCard({ species, isSelected, onSelect }: SpeciesCardProps): React.JSX.Element {
  const { t } = useTranslation('common');
  // eslint-disable-next-line security/detect-object-injection
  const theme = SPECIES_THEME[species];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={clsx(
        'card card-compact relative w-full cursor-pointer text-center',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        theme.cardBg,
        isSelected
          ? `ring-2 ${theme.ring} ring-offset-2 shadow-md scale-[1.02]`
          : 'ring-1 ring-transparent shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.98]',
        `focus-visible:${theme.ring}`,
      )}
    >
      {isSelected && (
        <span
          aria-hidden="true"
          className={clsx(
            'badge badge-sm absolute right-2 top-2 text-white border-0',
            theme.checkBg,
          )}
        >
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2,6 5,9 10,3" />
          </svg>
        </span>
      )}

      <div className="card-body items-center gap-2 py-4 px-3">
        <div aria-hidden="true">
          <CompanionAvatar species={species} stage="seedling" mood="calm" size={80} />
        </div>

        <div className="card-title flex-col gap-0.5 text-center">
          <p className="text-sm font-bold tracking-tight text-ink">
            {t(`species.${species}.name`)}
          </p>
          <p className={clsx('text-xs font-medium', theme.tagline)}>
            {t(`species.${species}.tagline`)}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Step 1: species selection ────────────────────────────────────────────────

interface StepSpeciesProps {
  speciesList: CompanionSpecies[];
  selected: CompanionSpecies | null;
  onSelect: (s: CompanionSpecies) => void;
  onContinue: () => void;
  onBack: () => void;
}

function StepSpecies({
  speciesList,
  selected,
  onSelect,
  onContinue,
  onBack,
}: StepSpeciesProps): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {t('speciesSelect.title')}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t('speciesSelect.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {speciesList.map((sp) => (
          <SpeciesCard
            key={sp}
            species={sp}
            isSelected={selected === sp}
            onSelect={() => onSelect(sp)}
          />
        ))}
      </div>

      {selected !== null && (
        <div
          key={selected}
          className={clsx(
            'alert animate-enter rounded-2xl border py-2.5 px-4 text-center',
            // eslint-disable-next-line security/detect-object-injection
            SPECIES_THEME[selected].descBg,
            // eslint-disable-next-line security/detect-object-injection
            SPECIES_THEME[selected].descBorder,
          )}
        >
          <p className="text-xs leading-relaxed text-ink-secondary w-full">
            {t(`species.${selected}.description`)}
          </p>
        </div>
      )}

      <Button
        onClick={onContinue}
        label={t('speciesSelect.continue')}
        isDisabled={selected === null}
        variant="primary"
        size="lg"
      />

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lavender"
      >
        ← {t('styleSelect.title')}
      </button>
    </div>
  );
}

// ─── Step 2: name input ───────────────────────────────────────────────────────

interface StepNameProps {
  species: CompanionSpecies;
  nameInput: string;
  nameError: string | null;
  isDisabled: boolean;
  setNameInput: (v: string) => void;
  onCreate: () => void;
  onBack: () => void;
}

function StepName({
  species,
  nameInput,
  nameError,
  isDisabled,
  setNameInput,
  onCreate,
  onBack,
}: StepNameProps): React.JSX.Element {
  const { t } = useTranslation(['common', 'errors']);
  // eslint-disable-next-line security/detect-object-injection
  const theme = SPECIES_THEME[species];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <div
        className={clsx(
          'flex flex-col items-center gap-3 rounded-3xl px-6 pb-6 pt-7',
          theme.cardBg,
        )}
      >
        <div className="animate-float" aria-hidden="true">
          <CompanionAvatar species={species} stage="seedling" mood="radiant" size={120} />
        </div>
        <div className="text-center">
          <p className="text-base font-bold tracking-tight text-ink">
            {t(`species.${species}.name`)}
          </p>
          <p className={clsx('mt-0.5 text-xs font-semibold', theme.tagline)}>
            {t(`species.${species}.tagline`)}
          </p>
        </div>
      </div>

      <div>
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
            if (e.key === 'Enter') onCreate();
          }}
          placeholder={t('companionNamePlaceholder', { ns: 'common' })}
          maxLength={24}
          disabled={isDisabled}
          aria-describedby={nameError ? 'name-error' : undefined}
          aria-invalid={nameError !== null}
          className="input input-bordered w-full bg-parchment text-ink placeholder:text-ink-faint focus:outline-none focus:border-lavender disabled:opacity-50"
        />

        {nameError && (
          <p id="name-error" role="alert" className="mt-2 text-sm text-warm-peach">
            {/* eslint-disable-next-line security/detect-object-injection */}
            {t(ERROR_KEY_MAP[nameError] ?? 'nameInvalidChars', { ns: 'errors' })}
          </p>
        )}
      </div>

      <Button
        onClick={onCreate}
        label={t('createCompanion', { ns: 'common' })}
        isDisabled={isDisabled || nameInput.trim().length === 0}
        variant="primary"
        size="lg"
      />

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lavender"
      >
        {t('speciesSelect.backToSpecies')}
      </button>
    </div>
  );
}

// ─── Exported form — manages step state ──────────────────────────────────────

export function CreatePetForm(): React.JSX.Element {
  const [step, setStep] = useState<'style' | 'species' | 'name'>('style');
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle | null>(null);

  const { selectedSpecies, selectSpecies, nameInput, nameError, setNameInput, create, isDisabled } =
    useCreateCompanion();

  const speciesList = avatarStyle === '2d' ? SPECIES_2D : SPECIES_3D;

  if (step === 'style') {
    return (
      <StepStyle
        selected={avatarStyle}
        onSelect={setAvatarStyle}
        onContinue={() => setStep('species')}
      />
    );
  }

  if (step === 'species') {
    return (
      <StepSpecies
        speciesList={speciesList}
        selected={selectedSpecies}
        onSelect={selectSpecies}
        onContinue={() => setStep('name')}
        onBack={() => setStep('style')}
      />
    );
  }

  // Defensive: if somehow reached step 'name' without a species, go back
  if (!selectedSpecies) return <></>;

  return (
    <StepName
      species={selectedSpecies}
      nameInput={nameInput}
      nameError={nameError}
      isDisabled={isDisabled}
      setNameInput={setNameInput}
      onCreate={create}
      onBack={() => setStep('species')}
    />
  );
}
