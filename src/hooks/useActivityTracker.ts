import { useEffect, useRef } from 'react';
import { api } from '../lib/api.ts';

export function useActivityTracker() {
  const startTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(window.location.pathname + window.location.hash);

  useEffect(() => {
    // Retrieve or create temporary anonymous session id in sessionStorage (no persistent cookies)
    let sessionId = sessionStorage.getItem('mt_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      try {
        sessionStorage.setItem('mt_session_id', sessionId);
      } catch {}
    }

    const currentPath = window.location.pathname + (window.location.hash || '');
    currentPathRef.current = currentPath;
    startTimeRef.current = Date.now();

    // Initial hit
    api.activity.track(sessionId, currentPath, 0);

    const handleHashChange = () => {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const prevPath = currentPathRef.current;
      const newPath = window.location.pathname + (window.location.hash || '');

      // Send duration for previous path
      if (durationSeconds > 1 && sessionId) {
        api.activity.track(sessionId, prevPath, durationSeconds);
      }

      currentPathRef.current = newPath;
      startTimeRef.current = Date.now();
      if (sessionId) {
        api.activity.track(sessionId, newPath, 0);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    const handleBeforeUnload = () => {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSeconds > 1 && sessionId) {
        // Use sendBeacon if available for reliability
        const payload = JSON.stringify({
          sessionId,
          pagePath: currentPathRef.current,
          durationSeconds,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/activity/track', new Blob([payload], { type: 'application/json' }));
        } else {
          api.activity.track(sessionId, currentPathRef.current, durationSeconds);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
