import { useEffect } from 'react';
import { GAME_TICK_MS } from '@entities/companion';
import { useCompanionStore } from '@entities/companion/model/companionStore';

/**
 * Drives the game loop via setInterval.
 * Mount this hook once at the app root (GamePage or AppProviders).
 *
 * Pauses automatically when:
 * - No companion exists
 * - companion.isResting = true (user-initiated rest)
 * - companion.isInRestMode = true (critical state — replaces death, R7)
 *
 * The dependency array uses companion?.isResting and companion?.isInRestMode
 * intentionally — the loop restarts only when these pause states change,
 * NOT on every stat update (which would cause restart every 6 seconds).
 */
export const useGameLoop = (): void => {
  const tickGameLoop = useCompanionStore((state) => state.tickGameLoop);
  const companionId = useCompanionStore((state) => state.companion?.id);
  const isResting = useCompanionStore((state) => state.companion?.isResting);
  const isInRestMode = useCompanionStore((state) => state.companion?.isInRestMode);

  useEffect(() => {
    // Do not run if no companion or if any pause state is active
    if (!companionId || isResting || isInRestMode) return;

    const intervalId = window.setInterval(tickGameLoop, GAME_TICK_MS);

    // MANDATORY cleanup — prevents memory leaks and phantom ticks after unmount
    return () => window.clearInterval(intervalId);
  }, [companionId, isResting, isInRestMode, tickGameLoop]);
};
