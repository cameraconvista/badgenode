import { useState, useEffect } from 'react';
import SettingsModal from '@/components/home/SettingsModal';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateAfterTimbratura, debounce } from '@/state/timbrature.cache';
import { useTimbratureActions } from './components/TimbratureActions';
import HomeContainer from './components/HomeContainer';

export default function Home() {
  const [pin, setPin] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
      feedback={feedback}
      loading={loading}
      onKeyPress={handleKeyPress}
      onClear={handleClear}
      onSettings={handleSettings}
      onEntrata={handleEntrata}
      onUscita={handleUscita}
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
