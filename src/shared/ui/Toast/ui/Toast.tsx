import React from 'react';
import { clsx } from 'clsx';
import { useToastStore } from '../model/toastStore';

// Maps toast type → DaisyUI alert variant class
const alertClass = {
  nudge: 'alert bg-lavender/20 border-lavender/40 text-ink',
  celebration: 'alert alert-success',
  info: 'alert bg-parchment border-soft-gray/40 text-ink',
} as const;

export function ToastContainer(): React.JSX.Element | null {
  const toast = useToastStore((s) => s.toast);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (!toast) return null;

  return (
    <div
      className="toast toast-bottom toast-center z-40 w-full max-w-sm px-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={clsx(
          'flex items-start justify-between gap-3 shadow-md',
          'animate-enter',
          alertClass[toast.type],
        )}
      >
        <p className="text-sm leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss"
          className="btn btn-ghost btn-xs btn-circle shrink-0 text-ink-muted hover:text-ink"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
