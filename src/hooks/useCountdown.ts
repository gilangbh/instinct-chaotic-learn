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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(Date.now());

  // Sync with server countdown when it changes
  useEffect(() => {
    if (serverCountdown !== null && serverCountdown !== countdown) {
      // Only sync if difference is significant (> 2 seconds) to avoid jitter
      const diff = Math.abs(serverCountdown - countdown);
      if (diff > 2 || countdown === 0) {
        setCountdown(serverCountdown);
        lastSyncRef.current = Date.now();
      }
    }
  }, [serverCountdown]);

  // Client-side countdown ticker
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only run countdown if > 0
    if (countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Tick every second
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [countdown > 0]);

  return countdown;
}


