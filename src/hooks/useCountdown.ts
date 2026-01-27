import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountdownOptions {
  /** Callback appelé quand le countdown atteint 0 */
  onComplete?: () => void;
}

interface UseCountdownReturn {
  /** Secondes restantes */
  remaining: number;
  /** Countdown actif */
  isActive: boolean;
  /** Démarre le countdown avec un nombre de secondes */
  start: (seconds: number) => void;
  /** Arrête le countdown sans reset */
  stop: () => void;
  /** Reset à 0 et arrête */
  reset: () => void;
}

/**
 * Hook réutilisable pour gérer un countdown en secondes.
 * Fonction pure avec callback optionnel à la fin.
 *
 * @example
 * ```typescript
 * const { remaining, isActive, start } = useCountdown({
 *   onComplete: () => setIsRateLimited(false)
 * });
 *
 * // Démarrer countdown de 60s
 * start(60);
 * ```
 */
export function useCountdown(options: UseCountdownOptions = {}): UseCountdownReturn {
  const { onComplete } = options;
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated to avoid stale closures
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      setRemaining(seconds);
      setIsActive(true);
    },
    [clearTimer]
  );

  const stop = useCallback(() => {
    clearTimer();
    setIsActive(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(0);
    setIsActive(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!isActive || remaining <= 0) {
      if (intervalRef.current) {
        clearTimer();
      }
      if (isActive && remaining === 0) {
        setIsActive(false);
        onCompleteRef.current?.();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return clearTimer;
  }, [isActive, remaining, clearTimer]);

  return { remaining, isActive, start, stop, reset };
}
