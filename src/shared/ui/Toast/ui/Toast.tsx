import React from 'react';
import { clsx } from 'clsx';
import { useToastStore } from '../model/toastStore';

const typeClasses = {
  nudge: 'bg-lavender/20 border-lavender/40 text-calm-text',
  celebration: 'bg-sage/20 border-sage/40 text-calm-text',
  info: 'bg-warm-white border-soft-gray/40 text-calm-text',
};

export function ToastContainer(): React.JSX.Element | null {
  const toast = useToastStore((s) => s.toast);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (!toast) return null;

  return (
    // Fixed at bottom-center, above all other content
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 left-1/2 z-40 w-full max-w-sm -translate-x-1/2 px-4"
    >
      <div
        className={clsx(
          'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-md',
          'animate-in fade-in slide-in-from-bottom-2 duration-300',
          typeClasses[toast.type],
        )}
      >
        <p className="text-sm leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss"
          className="text-calm-text-muted hover:text-calm-text mt-0.5 shrink-0 transition-colors"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
