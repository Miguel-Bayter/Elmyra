import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CrisisLink } from '@shared/ui/CrisisLink';
import { ToastContainer } from '@shared/ui/Toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSettingsClick = (): void => {
    if (location.pathname === '/settings') {
      // Always go to /companion when closing settings — never to / (welcome page)
      void navigate('/companion');
    } else {
      void navigate('/settings');
    }
  };

  return (
    <div className="bg-game-gradient flex min-h-screen flex-col">
      {/* Header — quiet, always accessible */}
      <header className="navbar bg-header-frosted border-b-soft sticky top-0 z-30 px-3 py-0 min-h-[52px]">
        {/* Wordmark — small, not competing with companion */}
        <div className="navbar-start">
          <Link to="/" className="group btn btn-ghost btn-sm gap-2 px-2 focus-visible:outline-none">
            {/* Small lavender dot — brand signature */}
            <span
              className="h-2 w-2 rounded-full bg-lavender transition-transform group-hover:scale-125"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold tracking-tight text-ink">{t('appTitle')}</span>
          </Link>
        </div>

        <div className="navbar-end gap-0.5">
          {/* Crisis link — heart icon, always visible (R7) */}
          <CrisisLink />

          {/* Settings — toggles back when already on /settings */}
          <button
            type="button"
            onClick={handleSettingsClick}
            aria-label={t('settings')}
            className="btn btn-ghost btn-sm btn-square text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/50"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main — centers vertically on large screens where content is shorter than viewport */}
      <main className="flex flex-1 flex-col items-center sm:justify-center">{children}</main>

      <ToastContainer />
    </div>
  );
}
