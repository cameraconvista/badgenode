import { useState, useEffect } from 'react';
import SettingsModal from '@/components/home/SettingsModal';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateAfterTimbratura, debounce } from '@/state/timbrature.cache';
import { useTimbratureActions } from './components/TimbratureActions';
import HomeContainer from './components/HomeContainer';
import { TimbratureService } from '@/services/timbrature.service';
import { formatDateLocal } from '@/lib/time';

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
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pin) { setLastAllowed(null); return; }
      try {
        const today = formatDateLocal(new Date());
        const list = await TimbratureService.getTimbratureGiorno(Number(pin), today);
        const last = list.sort((a, b) => (a.ts_order || '').localeCompare(b.ts_order || '')).at(-1);
        if (cancelled) return;
        if (!last) { setLastAllowed('entrata'); return; }
        setLastAllowed(last.tipo === 'entrata' ? 'uscita' : 'entrata');
      } catch (_) {
        if (!cancelled) setLastAllowed(null);
      }
    })();
    return () => { cancelled = true; };
  }, [pin, feedback.type]);

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
    <HomeContainer
      pin={pin}
      lastPin={lastPinToast}
      disabledEntrata={lastAllowed === 'uscita'}
      disabledUscita={lastAllowed === 'entrata'}
      feedback={feedback}
      loading={loading}
      onKeyPress={handleKeyPress}
      onClear={handleClear}
      onSettings={handleSettings}
      onEntrata={async () => {
        if (lastAllowed === 'uscita') { setFeedback({ type: 'error', message: 'Alternanza violata: entrata consecutiva nello stesso giorno logico' }); return; }
        setLastPinToast(pin); await handleEntrata();
      }}
      onUscita={async () => {
        if (lastAllowed === 'entrata') { setFeedback({ type: 'error', message: 'Manca ENTRATA di ancoraggio per questa uscita' }); return; }
        setLastPinToast(pin); await handleUscita();
      }}
      onFeedbackClose={() => setFeedback({ type: null, message: '' })}
    >
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSuccess={handleSettingsSuccess}
      />
    </HomeContainer>
  );
}
