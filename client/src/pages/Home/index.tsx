import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SettingsModal from '@/components/home/SettingsModal';
import AppPinGate from '@/components/home/AppPinGate';
import IntroSplash from '@/components/home/IntroSplash';
import { getPinSettings } from '@/services/settings.service';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateAfterTimbratura, debounce } from '@/state/timbrature.cache';
import { useTimbratureActions } from './components/TimbratureActions';
import HomeContainer from './components/HomeContainer';
import { createTimbraturaTraceId, logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';
import { useIntroSplash } from './hooks/useIntroSplash';
import { useLastAllowedPrecheck } from './hooks/useLastAllowedPrecheck';

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
  const [lastTraceId, setLastTraceId] = useState<string>('');
  const { showIntroLayer, introVisible, homeVisible } = useIntroSplash();

  // Config PIN admin (dal DB): decide se il tasto ⚙ chiede il PIN o entra diretto.
  // Fallback prudente (requirePin:false) se non caricata.
  const { data: pinSettings } = useQuery({
    queryKey: ['settings', 'pin', 'admin'],
    queryFn: () => getPinSettings('admin'),
    staleTime: 60_000,
  });

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

  const lastAllowed = useLastAllowedPrecheck(pin);

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
    // Toggle OFF (default) → accesso diretto all'area admin, senza chiedere il PIN.
    // Toggle ON → mostra il modale che valida il PIN contro quello salvato nel DB.
    if (pinSettings?.requirePin) {
      setShowSettingsModal(true);
    } else {
      handleSettingsSuccess();
    }
  };

  const handleSettingsSuccess = () => {
    // Navigate to Archivio Dipendenti page
    window.location.href = '/archivio-dipendenti';
  };

  return (
    <AppPinGate>
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
            expectedPin={pinSettings?.pin}
          />
        </HomeContainer>
      </div>
      {showIntroLayer && <IntroSplash visible={introVisible} />}
    </AppPinGate>
  );
}
