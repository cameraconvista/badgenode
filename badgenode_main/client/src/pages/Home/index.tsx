import { useState, useEffect } from 'react';
import SettingsModal from '@/components/home/SettingsModal';
import IntroSplash from '@/components/home/IntroSplash';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateAfterTimbratura, debounce } from '@/state/timbrature.cache';
import { useTimbratureActions } from './components/TimbratureActions';
import HomeContainer from './components/HomeContainer';
import { supabase } from '@/lib/supabaseClient';
import { formatDateLocal } from '@/lib/time';
import { createTimbraturaTraceId, logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';

const INTRO_TOTAL_MS = 3500;
const INTRO_FADE_OUT_START_MS = 2400;
const HOME_FADE_IN_START_MS = 2600;
const INTRO_REOPEN_THRESHOLD_MS = 1200;

export default function Home() {
  const [pin, setPin] = useState('');
  const [lastPinToast, setLastPinToast] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [lastAllowed, setLastAllowed] = useState<'entrata' | 'uscita' | null>(null);
  const [lastTraceId, setLastTraceId] = useState<string>('');
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

  // Realtime subscription per dipendente
  useEffect(() => {
    if (!user?.pin) return;

    const debouncedInvalidate = debounce(() => {
      invalidateAfterTimbratura(user.pin!);
    }, 250);

    const unsubscribe = subscribeTimbrature({
      pin: user.pin,
      onChange: () => {
        debouncedInvalidate();
      },
    });

    return () => unsubscribe();
  }, [user?.pin]);

  // Refetch ultimo timbro per il PIN digitato e aggiorna azione consentita
  // AUTO-RECOVERY: Per uscite notturne (00:00-05:00), cerca ultima entrata aperta
  // OTTIMIZZATO: Query per PIN valido (1-4 digit) con debounce
  useEffect(() => {
    // Reset immediato per PIN vuoto o invalido
    if (!pin || pin.length < 1 || pin.length > 4) {
      setLastAllowed(null);
      return;
    }

    // Debounce 300ms per evitare query multiple durante digitazione veloce
    const timer = setTimeout(() => {
      let cancelled = false;

      (async () => {
        try {
          const now = new Date();
          const targetDate = new Date(now);
          const isNightShift = now.getHours() >= 0 && now.getHours() < 5;

          // Se ora < 05:00, cerca sul giorno precedente (giorno logico)
          if (isNightShift) {
            targetDate.setDate(targetDate.getDate() - 1);
          }

          const giornoLogico = formatDateLocal(targetDate);

          // Query ottimizzata: usa Supabase direttamente con limit e order
          const { data: timbratureList } = await supabase
            .from('timbrature')
            .select('tipo, ts_order')
            .eq('pin', Number(pin))
            .eq('giorno_logico', giornoLogico)
            .order('ts_order', { ascending: false })
            .limit(1);

          const lastTimbratura = timbratureList?.[0] as { tipo: 'entrata' | 'uscita'; ts_order: string } | undefined;

          if (cancelled) return;

          // AUTO-RECOVERY: Se uscita notturna e non trova timbrature sul giorno logico,
          // cerca ultima entrata aperta (stesso comportamento del server)
          if (!lastTimbratura && isNightShift) {
            const { data: entryList } = await supabase
              .from('timbrature')
              .select('tipo, ts_order')
              .eq('pin', Number(pin))
              .eq('tipo', 'entrata')
              .order('ts_order', { ascending: false })
              .limit(1);

            if (cancelled) return;

            const lastEntry = entryList?.[0];
            if (lastEntry) {
              // Trovata entrata aperta: abilita uscita
              logTimbraturaDiag('home.lastAllowed_decision', {
                pin,
                source: 'home-precheck',
                lastAllowed: 'uscita',
                reason: 'night-open-entry-fallback',
                giornoLogico,
              });
              setLastAllowed('uscita');
              return;
            }
          }

          if (!lastTimbratura) {
            logTimbraturaDiag('home.lastAllowed_decision', {
              pin,
              source: 'home-precheck',
              lastAllowed: 'entrata',
              reason: 'no-last-timbratura',
              giornoLogico,
            });
            setLastAllowed('entrata');
            return;
          }

          logTimbraturaDiag('home.lastAllowed_decision', {
            pin,
            source: 'home-precheck',
            lastAllowed: lastTimbratura.tipo === 'entrata' ? 'uscita' : 'entrata',
            reason: 'last-timbratura',
            giornoLogico,
            lastTipo: lastTimbratura.tipo,
            lastTsOrder: lastTimbratura.ts_order,
          });
          setLastAllowed(lastTimbratura.tipo === 'entrata' ? 'uscita' : 'entrata');
        } catch {
          if (!cancelled) {
            // In caso di errore, permetti entrata (fail-safe)
            logTimbraturaDiag('home.lastAllowed_decision', {
              pin,
              source: 'home-precheck',
              lastAllowed: 'entrata',
              reason: 'query-error-fallback',
            });
            setLastAllowed('entrata');
          }
        }
      })();

      return () => { cancelled = true; };
    }, 300);

    return () => clearTimeout(timer);
  }, [pin]);

  const { handleEntrata, handleUscita } = useTimbratureActions({
    pin,
    setPin,
    setLoading,
    setFeedback,
  });

  const handleKeyPress = (key: string) => {
    if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleSettingsSuccess = () => {
    // Navigate to Archivio Dipendenti page
    window.location.href = '/archivio-dipendenti';
  };

  return (
    <>
      <div className={`transition-opacity duration-700 ${homeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <HomeContainer
          pin={pin}
          lastPin={lastPinToast}
          lastTraceId={lastTraceId}
          disabledEntrata={lastAllowed !== null && lastAllowed !== 'entrata'}
          disabledUscita={lastAllowed !== null && lastAllowed !== 'uscita'}
          feedback={feedback}
          loading={loading}
          onKeyPress={handleKeyPress}
          onClear={handleClear}
          onSettings={handleSettings}
          onEntrata={async () => {
            const traceId = createTimbraturaTraceId(pin, 'entrata');
            setLastTraceId(traceId);
            logTimbraturaDiag('home.click', {
              traceId,
              pin,
              tipo: 'entrata',
              source: 'home',
              lastAllowed,
            });
            if (lastAllowed !== null && lastAllowed !== 'entrata') {
              logTimbraturaDiag('home.blocked_precheck', {
                traceId,
                pin,
                tipo: 'entrata',
                source: 'home-precheck',
                lastAllowed,
                userMessage: 'Alternanza violata: entrata consecutiva nello stesso giorno logico',
              });
              setFeedback({ type: 'error', message: 'Alternanza violata: entrata consecutiva nello stesso giorno logico' });
              return;
            }
            logTimbraturaDiag('home.precheck_passed', {
              traceId,
              pin,
              tipo: 'entrata',
              source: 'home-precheck',
              lastAllowed,
            });
            setLastPinToast(pin);
            await handleEntrata(traceId);
          }}
          onUscita={async () => {
            const traceId = createTimbraturaTraceId(pin, 'uscita');
            setLastTraceId(traceId);
            logTimbraturaDiag('home.click', {
              traceId,
              pin,
              tipo: 'uscita',
              source: 'home',
              lastAllowed,
            });
            if (lastAllowed !== null && lastAllowed !== 'uscita') {
              logTimbraturaDiag('home.blocked_precheck', {
                traceId,
                pin,
                tipo: 'uscita',
                source: 'home-precheck',
                lastAllowed,
                userMessage: 'Manca ENTRATA di ancoraggio per questa uscita',
              });
              setFeedback({ type: 'error', message: 'Manca ENTRATA di ancoraggio per questa uscita' });
              return;
            }
            logTimbraturaDiag('home.precheck_passed', {
              traceId,
              pin,
              tipo: 'uscita',
              source: 'home-precheck',
              lastAllowed,
            });
            setLastPinToast(pin);
            await handleUscita(traceId);
          }}
          onFeedbackClose={() => setFeedback({ type: null, message: '' })}
        >
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onSuccess={handleSettingsSuccess}
          />
        </HomeContainer>
      </div>
      {showIntroLayer && <IntroSplash visible={introVisible} />}
    </>
  );
}
