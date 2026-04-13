import { useCallback, useRef } from 'react';
import { ACTION_DEBOUNCE_MS } from '@entities/companion';
import { useCompanionStore } from '@entities/companion/model/companionStore';

export const useComfortPet = () => {
  const companion = useCompanionStore((state) => state.companion);
  const performAction = useCompanionStore((state) => state.performAction);
  const lastActionRef = useRef<number>(0);

  const isDisabled =
    !companion || companion.isResting || companion.isInRestMode || companion.vitality >= 95;

  const comfort = useCallback(() => {
    const now = Date.now();
    // SECURITY: Debounce prevents rapid stat manipulation (R6)
    if (now - lastActionRef.current < ACTION_DEBOUNCE_MS) return;
    if (isDisabled) return;
    lastActionRef.current = now;
    performAction('comfort');
  }, [isDisabled, performAction]);

  return { comfort, isDisabled };
};
