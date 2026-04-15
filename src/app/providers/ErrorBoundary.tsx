import { Component, type ReactNode, type ErrorInfo } from 'react';
import { CrisisLink } from '@shared/ui/CrisisLink';

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly hasError: boolean;
}

// OWASP A10 — catches runtime errors without exposing stack traces to users.
// Shows a generic, warm recovery screen with crisis resources still accessible.
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // SECURITY: Only log in development — never expose stack traces to production UI
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-parchment px-6 text-center">
          {/* Warm, non-alarming error illustration */}
          <div aria-hidden="true" className="opacity-40">
            <svg viewBox="0 0 80 80" className="h-20 w-20">
              <circle cx="40" cy="40" r="36" fill="#e8dff5" />
              <circle cx="32" cy="36" r="4" fill="#b8a3d8" />
              <circle cx="48" cy="36" r="4" fill="#b8a3d8" />
              <path
                d="M 30,52 Q 40,46 50,52"
                fill="none"
                stroke="#b8a3d8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="max-w-xs">
            <p className="text-base font-medium text-ink">
              Algo salió mal. Por favor, inténtalo de nuevo.
            </p>
            <p className="mt-1 text-sm text-ink-muted">Something went wrong. Please try again.</p>
          </div>

          <button type="button" onClick={this.handleRetry} className="btn btn-primary btn-sm px-6">
            Reintentar · Try again
          </button>

          {/* Crisis resources always reachable, even during errors (R7) */}
          <div className="mt-2 flex items-center gap-2 text-xs text-ink-faint">
            <span>¿Necesitas apoyo?</span>
            <CrisisLink />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
