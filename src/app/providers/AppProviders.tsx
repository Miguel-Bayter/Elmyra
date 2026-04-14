import { type ReactNode, Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
// i18n must be imported here to initialize BEFORE any component renders — R2
import '@shared/i18n/config';
import { ErrorBoundary } from './ErrorBoundary';
import { useCompanionStore } from '@entities/companion';

interface Props {
  readonly children: ReactNode;
}

// Applies the persisted theme to <html data-theme="..."> on mount and on change.
// This triggers the [data-theme="dark"] CSS vars defined in global.css.
function ThemeApplier(): null {
  const theme = useCompanionStore((s) => s.preferences.theme);

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
  }, [theme]);

  return null;
}

export function AppProviders({ children }: Props): React.JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeApplier />
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
