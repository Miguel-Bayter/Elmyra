import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CrisisLink } from '@shared/ui/CrisisLink';
import { ToastContainer } from '@shared/ui/Toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <div className="bg-game-gradient flex min-h-screen flex-col">
      {/* Header — quiet, always accessible */}
      <header className="bg-header-frosted border-b-soft sticky top-0 z-30 flex items-center justify-between px-5 py-3">
        {/* Wordmark — small, not competing with companion */}
        <Link to="/" className="group flex items-center gap-2 focus-visible:outline-none">
          {/* Small lavender dot — brand signature */}
          <span
            className="h-2 w-2 rounded-full bg-lavender transition-transform group-hover:scale-125"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold tracking-tight text-ink">{t('appTitle')}</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Crisis link — heart icon, always visible (R7) */}
          <CrisisLink />

          {/* Settings */}
          <Link
            to="/settings"
            aria-label={t('settings')}
            className="rounded-xl p-2 text-ink-muted transition-colors hover:bg-parchment-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/50"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center">{children}</main>

      <ToastContainer />
    </div>
  );
}
