import { useState, useEffect } from 'react';

const INTRO_TOTAL_MS = 3500;
const INTRO_FADE_OUT_START_MS = 2400;
const HOME_FADE_IN_START_MS = 2600;
const INTRO_REOPEN_THRESHOLD_MS = 1200;

export function useIntroSplash() {
  const [showIntroLayer, setShowIntroLayer] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [homeVisible, setHomeVisible] = useState(true);

  useEffect(() => {
    const INTRO_SESSION_KEY = 'bn_intro_shown_v1';
    let tFadeOut: number | null = null;
    let tHomeIn: number | null = null;
    let tHideIntro: number | null = null;
    let hiddenAt = 0;

    const clearTimers = () => {
      if (tFadeOut) window.clearTimeout(tFadeOut);
      if (tHomeIn) window.clearTimeout(tHomeIn);
      if (tHideIntro) window.clearTimeout(tHideIntro);
      tFadeOut = null;
      tHomeIn = null;
      tHideIntro = null;
    };

    const runIntro = () => {
      clearTimers();
      setHomeVisible(false);
      setShowIntroLayer(true);
      setIntroVisible(true);

      tFadeOut = window.setTimeout(() => {
        setIntroVisible(false);
      }, INTRO_FADE_OUT_START_MS);

      tHomeIn = window.setTimeout(() => {
        setHomeVisible(true);
      }, HOME_FADE_IN_START_MS);

      tHideIntro = window.setTimeout(() => {
        setShowIntroLayer(false);
      }, INTRO_TOTAL_MS);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }
      const elapsed = hiddenAt ? Date.now() - hiddenAt : 0;
      if (elapsed >= INTRO_REOPEN_THRESHOLD_MS) {
        runIntro();
      }
    };

    const shouldShowIntroOnMount = (() => {
      try {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        const isReload = navEntry?.type === 'reload';
        const alreadyShown = sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
        // Show on first app start in this tab/session, or on explicit reload.
        return isReload || !alreadyShown;
      } catch {
        // Conservative fallback: show intro once per session.
        return sessionStorage.getItem(INTRO_SESSION_KEY) !== '1';
      }
    })();

    if (shouldShowIntroOnMount) {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      runIntro();
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimers();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return { showIntroLayer, introVisible, homeVisible };
}
