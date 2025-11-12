import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for smooth countdown timer
 * 
 * @param initialSeconds - Initial countdown value from server
 * @param serverCountdown - Server countdown that gets updated periodically
 * @returns Current countdown in seconds
 */
export function useCountdown(initialSeconds: number | null, serverCountdown: number | null) {
  const [countdown, setCountdown] = useState<number>(initialSeconds || 0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(performance.now());

  // Sync with server countdown when it changes
  useEffect(() => {
    if (serverCountdown !== null && serverCountdown !== countdown) {
      // Only sync if difference is significant (> 2 seconds) to avoid jitter
      const diff = Math.abs(serverCountdown - countdown);
      if (diff > 2 || countdown === 0) {
        setCountdown(serverCountdown);
        lastTickRef.current = performance.now();
      }
    }
  }, [serverCountdown]);

  // Client-side countdown ticker
  useEffect(() => {
    const tick = (now: number) => {
      const elapsedMs = now - lastTickRef.current;
      if (elapsedMs >= 1000) {
        const secondsElapsed = Math.floor(elapsedMs / 1000);
        lastTickRef.current = now;
        setCountdown((prev) => {
          const next = prev - secondsElapsed;
          return next > 0 ? next : 0;
        });
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    if (countdown > 0 && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [countdown]);

  return countdown;
}







