import { useState } from 'react';
import LogoHeader from '@/components/home/LogoHeader';
import PinDisplay from '@/components/home/PinDisplay';
import Keypad from '@/components/home/Keypad';
import DateTimeLive from '@/components/home/DateTimeLive';
import ActionButtons from '@/components/home/ActionButtons';
import SettingsModal from '@/components/home/SettingsModal';
import FeedbackBanner from '@/components/FeedbackBanner';

export default function Home() {
  const [pin, setPin] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
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

  const handleEntrata = () => {
    if (pin.length === 0) {
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
    } else {
      console.log('Entrata:', pin);
      setFeedback({ type: 'success', message: 'Entrata registrata' });
      setPin('');
    }
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
  };

  const handleUscita = () => {
    if (pin.length === 0) {
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
    } else {
      console.log('Uscita:', pin);
      setFeedback({ type: 'success', message: 'Uscita registrata' });
    }
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
  };

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center p-4 overflow-hidden fixed inset-0"
      style={{ 
        background: 'radial-gradient(ellipse at center, #2d1b3d 0%, #1a0f2e 50%, #0f0a1a 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, message: '' })}
      />

      <div className="w-full max-w-sm md:max-w-md flex items-center justify-center">
        <div className="relative">
          {/* Riflesso che gira sulla cornice */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(231, 116, 240, 0.8) 85%, rgba(231, 116, 240, 0.4) 90%, transparent 95%)',
              padding: '2px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              animation: 'spin 7s linear infinite'
            }}
          />
          <div 
            className="rounded-3xl p-6 shadow-2xl border-2 w-full max-h-[90vh] overflow-hidden relative"
            style={{
              backgroundColor: '#2b0048',
              borderColor: 'rgba(231, 116, 240, 0.3)',
              minWidth: '320px',
              maxWidth: '420px'
            }}
          >
          <LogoHeader />
          <PinDisplay pin={pin} />
          <Keypad 
            onKeyPress={handleKeyPress} 
            onClear={handleClear} 
            onSettings={handleSettings} 
          />
          <DateTimeLive />
          <ActionButtons 
            onEntrata={handleEntrata} 
            onUscita={handleUscita} 
            disabled={false} 
          />
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSuccess={handleSettingsSuccess}
      />
    </div>
  );
}
