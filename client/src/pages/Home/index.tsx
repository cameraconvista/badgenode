import { useState, useEffect } from 'react';
import SettingsModal from '@/components/home/SettingsModal';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateAfterTimbratura, debounce } from '@/state/timbrature.cache';
import { useTimbratureActions } from './components/TimbratureActions';
import HomeContainer from './components/HomeContainer';
import { supabase } from '@/lib/supabaseClient';
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
  // AUTO-RECOVERY: Per uscite notturne (00:00-05:00), cerca ultima entrata aperta
  // OTTIMIZZATO: Query solo per PIN completo (4 digit) con debounce
  useEffect(() => {
    // Reset immediato per PIN incompleto
    if (!pin || pin.length !== 4) {
      setLastAllowed(null);
      return;
    }

    // Debounce 300ms per evitare query multiple durante digitazione veloce
    const timer = setTimeout(() => {
      let cancelled = false;
      
      (async () => {
        try {
          const now = new Date();
          let targetDate = new Date(now);
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
              setLastAllowed('uscita');
              return;
            }
          }
          
          if (!lastTimbratura) {
            setLastAllowed('entrata');
            return;
          }
          
          setLastAllowed(lastTimbratura.tipo === 'entrata' ? 'uscita' : 'entrata');
        } catch (error) {
          if (!cancelled) {
            // In caso di errore, permetti entrata (fail-safe)
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
