import { useCallback, useRef } from 'react';
import { ACTION_DEBOUNCE_MS } from '@entities/companion';
import { useCompanionStore } from '@entities/companion/model/companionStore';

export const usePlayWithPet = () => {
  const companion = useCompanionStore((state) => state.companion);
  const performAction = useCompanionStore((state) => state.performAction);
  const lastActionRef = useRef<number>(0);

  // Play costs energy and nourishment — disable when either is too low to avoid negative spiral
  const isDisabled =
    !companion ||
    companion.isResting ||
    companion.isInRestMode ||
    companion.joy >= 95 ||
    companion.energy <= 20 ||
    companion.nourishment <= 10;

  const play = useCallback(() => {
    const now = Date.now();
    // SECURITY: Debounce prevents rapid stat manipulation (R6)
    if (now - lastActionRef.current < ACTION_DEBOUNCE_MS) return;
    if (isDisabled) return;
    lastActionRef.current = now;
    performAction('play');
  }, [isDisabled, performAction]);

  return { play, isDisabled };
};
