import React, { useEffect, useId, useRef } from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void; // Optional — omit to make modal non-dismissible (disclaimer)
  title: string;
  children: React.ReactNode;
  closeLabel?: string; // aria label for close button
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeLabel = 'Close',
}: ModalProps): React.JSX.Element | null {
  const titleId = useId();
  const firstFocusableRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal and close on Escape
  useEffect(() => {
    if (!isOpen) return;

    // Move focus into modal on open
    firstFocusableRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
      // Focus trap: keep Tab inside modal
      if (e.key === 'Tab') {
        const modal = document.getElementById(titleId);
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, titleId]);

  if (!isOpen) return null;

  return (
    // Overlay — clicks close modal only if onClose is provided
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-calm-text/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Modal panel — stop click propagation so clicks inside don't close it */}
      <div
        id={titleId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${titleId}-title`}
        className={clsx(
          'bg-warm-white relative w-full max-w-md rounded-2xl p-6 shadow-xl',
          'focus:outline-none',
        )}
        onClick={(e) => e.stopPropagation()}
        ref={firstFocusableRef}
        tabIndex={-1}
      >
        {/* Close button — only rendered if onClose is provided */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="text-calm-text-muted hover:text-calm-text absolute right-4 top-4 rounded-lg p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        )}

        <h2 id={`${titleId}-title`} className="text-calm-text mb-4 text-xl font-semibold">
          {title}
        </h2>

        <div className="text-calm-text-muted text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
