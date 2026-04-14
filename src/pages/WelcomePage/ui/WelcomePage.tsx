import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompanionStore } from '@entities/companion';
import { Button } from '@shared/ui/Button';
import { CreatePetForm } from '@features/create-pet';

function SeedlingIllustration(): React.JSX.Element {
  return (
    <svg viewBox="0 0 120 140" className="h-full w-full" aria-hidden="true">
      <circle cx="60" cy="90" r="52" fill="#e8dff5" opacity="0.4" />
      <path
        d="M60 115 Q58 90 60 72"
        stroke="#93b98b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M60 90 Q40 75 38 58 Q55 68 60 82" fill="#a8d8c8" opacity="0.85" />
      <path d="M60 82 Q80 68 82 52 Q64 65 60 78" fill="#93b98b" opacity="0.85" />
      <path d="M60 72 Q55 60 58 50 Q63 62 60 70" fill="#b8a3d8" opacity="0.7" />
      <circle cx="60" cy="110" r="24" fill="#b8a3d8" />
      <circle cx="53" cy="108" r="3" fill="#2d2520" opacity="0.7" />
      <circle cx="67" cy="108" r="3" fill="#2d2520" opacity="0.7" />
      <path
        d="M54 116 Q60 120 66 116"
        stroke="#2d2520"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <ellipse cx="60" cy="130" rx="28" ry="8" fill="#e8b090" opacity="0.3" />
    </svg>
  );
}

interface DisclaimerOverlayProps {
  onAccept: () => void;
}

function DisclaimerOverlay({ onAccept }: DisclaimerOverlayProps): React.JSX.Element {
  const { t } = useTranslation('legal');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="disclaimer-title"
    >
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" aria-hidden="true" />

      <div className="animate-enter border-lavender-card relative w-full max-w-md rounded-3xl bg-parchment p-8 shadow-2xl shadow-ink/10">
        <div className="mb-6 h-1 w-12 rounded-full bg-lavender" aria-hidden="true" />

        <h2 id="disclaimer-title" className="mb-3 text-xl font-semibold leading-snug text-ink">
          {t('disclaimer.title')}
        </h2>

        <p className="mb-3 text-sm leading-relaxed text-ink-secondary">{t('disclaimer.body')}</p>

        <p className="border-lavender-card mb-8 rounded-2xl bg-lavender-mist px-4 py-3 text-xs leading-relaxed text-ink-muted">
          {t('disclaimer.crisisNote')}
        </p>

        <Button onClick={onAccept} label={t('disclaimer.accept')} variant="primary" size="lg" />
      </div>
    </div>
  );
}

export function WelcomePage(): React.JSX.Element {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const companion = useCompanionStore((s) => s.companion);
  const disclaimerAccepted = useCompanionStore((s) => s.preferences.disclaimerAccepted);
  const acceptDisclaimer = useCompanionStore((s) => s.acceptDisclaimer);
  const loadFromStorage = useCompanionStore((s) => s.loadFromStorage);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setLoaded(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (loaded && companion && disclaimerAccepted) {
      void navigate('/companion');
    }
  }, [loaded, companion, disclaimerAccepted, navigate]);

  return (
    <div className="bg-welcome-gradient relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Decorative blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lavender opacity-10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sage opacity-10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-peach-light opacity-15 blur-2xl" />
      </div>

      <div className="animate-enter relative flex w-full max-w-sm flex-col items-center gap-8">
        <div className="animate-float h-36 w-36">
          <SeedlingIllustration />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink">{t('appTitle')}</h1>
          <p className="mt-1.5 text-base text-ink-muted">{t('appSubtitle')}</p>
        </div>

        {disclaimerAccepted && (
          <div className="w-full animate-enter">
            <CreatePetForm />
          </div>
        )}
      </div>

      {!disclaimerAccepted && <DisclaimerOverlay onAccept={acceptDisclaimer} />}
    </div>
  );
}
