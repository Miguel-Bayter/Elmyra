import React, { useEffect, useId, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void; // Optional — omit to make modal non-dismissible (disclaimer)
  title: string;
  children: React.ReactNode;
  closeLabel?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeLabel = 'Close',
}: ModalProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Sync isOpen → native dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal(); // Native dialog: focus trap + Escape key built-in
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Wire native dialog cancel (Escape key) → onClose prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !onClose) return;

    const handleCancel = (e: Event): void => {
      e.preventDefault(); // Prevent default close so we control state
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className="modal modal-middle" aria-labelledby={titleId}>
      <div className="modal-box relative bg-parchment border-lavender-card max-w-md rounded-3xl p-6 shadow-xl shadow-ink/10">
        {/* Close button — only when onClose is provided */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3 text-ink-muted hover:text-ink"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        )}

        <h2 id={titleId} className="mb-4 text-xl font-semibold text-ink">
          {title}
        </h2>

        <div className="text-sm leading-relaxed text-ink-secondary">{children}</div>
      </div>

      {/* Backdrop — clicking it closes if onClose is provided */}
      {onClose && (
        <form method="dialog" className="modal-backdrop">
          <button type="submit" onClick={onClose} aria-label={closeLabel}>
            close
          </button>
        </form>
      )}
    </dialog>
  );
}
