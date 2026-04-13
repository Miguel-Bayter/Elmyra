import { type ReactNode, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
// i18n must be imported here to initialize BEFORE any component renders — R2
import '@shared/i18n/config';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  readonly children: ReactNode;
}

export function AppProviders({ children }: Props): React.JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-warm-white">
              <p className="text-calm-text-muted text-sm">Loading...</p>
            </div>
          }
        >
          {children}
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
