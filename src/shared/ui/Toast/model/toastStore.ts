import { create } from 'zustand';

export type ToastType = 'nudge' | 'celebration' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toast: Toast | null;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: () => void;
}

// Auto-dismiss after 5 seconds — R7: more time to read, not stressful
const AUTO_DISMISS_MS = 5_000;

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,

  showToast: (message, type = 'info') => {
    // Clear any pending auto-dismiss
    if (dismissTimer) clearTimeout(dismissTimer);

    const id = `toast-${Date.now()}`;
    set({ toast: { id, message, type } });

    dismissTimer = setTimeout(() => {
      set({ toast: null });
      dismissTimer = null;
    }, AUTO_DISMISS_MS);
  },

  dismissToast: () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    set({ toast: null });
  },
}));
