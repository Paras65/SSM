import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeoutMs?: number; // Inactivity duration before locking (default: 30 minutes)
  enabled?: boolean;  // Whether tracking is currently active (e.g. only in admin/teacher/sankul modes)
}

export function useIdleTimeout({
  timeoutMs = 30 * 60 * 1000,
  enabled = false
}: UseIdleTimeoutOptions) {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (enabled && !isLocked) {
      timerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, timeoutMs);
    }
  }, [enabled, isLocked, timeoutMs]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      setIsLocked(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => {
      if (!isLocked) {
        resetTimer();
      }
    };

    events.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
    };
  }, [enabled, isLocked, resetTimer]);

  return { isLocked, unlock };
}

