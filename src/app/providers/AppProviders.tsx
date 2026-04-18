import { type ReactNode, Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
// i18n must be imported here to initialize BEFORE any component renders — R2
import i18n from '@shared/i18n/config';
import { ErrorBoundary } from './ErrorBoundary';
import { useCompanionStore } from '@entities/companion';

interface Props {
  readonly children: ReactNode;
}

// Applies the persisted theme to <html data-theme="..."> on mount and on change.
function ThemeApplier(): null {
  const theme = useCompanionStore((s) => s.preferences.theme);

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
  }, [theme]);

  return null;
}

// Syncs the persisted language to i18n AND updates <html lang="..."> for a11y/SEO.
// Store is the single source of truth — i18n detector is overridden on every change.
function LanguageApplier(): null {
  const language = useCompanionStore((s) => s.preferences.language);

  useEffect(() => {
    document.documentElement.lang = language;
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  return null;
}

// Loads persisted preferences + companion once at app level so any route has them.
// WelcomePage and GamePage may also call this — it is idempotent.
function StoreInitializer(): null {
  const loadFromStorage = useCompanionStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  return null;
}

export function AppProviders({ children }: Props): React.JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <StoreInitializer />
        <ThemeApplier />
        <LanguageApplier />
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-parchment">
              <span className="loading loading-dots loading-md text-primary" />
            </div>
          }
        >
          {children}
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
