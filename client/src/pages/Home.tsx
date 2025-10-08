import { useState } from 'react';
import LogoHeader from '@/components/home/LogoHeader';
import PinDisplay from '@/components/home/PinDisplay';
import Keypad from '@/components/home/Keypad';
import DateTimeLive from '@/components/home/DateTimeLive';
import ActionButtons from '@/components/home/ActionButtons';
import SettingsModal from '@/components/home/SettingsModal';
import FeedbackBanner from '@/components/FeedbackBanner';
import { useAuth } from '@/contexts/AuthContext';
import { TimbratureService } from '@/services/timbrature.service';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [pin, setPin] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

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

  const handleEntrata = async () => {
    if (pin.length === 0) {
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
      return;
    }

    setLoading(true);
    try {
      await TimbratureService.timbra('entrata');
      setFeedback({ type: 'success', message: 'Entrata registrata' });
      setPin('');
      
      toast({
        title: "Entrata registrata",
        description: `PIN ${user?.pin || pin} - ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante la registrazione';
      setFeedback({ type: 'error', message });
      
      toast({
        title: "Errore timbratura",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
    }
  };

  const handleUscita = async () => {
    if (pin.length === 0) {
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
      return;
    }

    setLoading(true);
    try {
      await TimbratureService.timbra('uscita');
      setFeedback({ type: 'success', message: 'Uscita registrata' });
      setPin('');
      
      toast({
        title: "Uscita registrata",
        description: `PIN ${user?.pin || pin} - ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante la registrazione';
      setFeedback({ type: 'error', message });
      
      toast({
        title: "Errore timbratura",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
    }
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
        <div 
          className="rounded-3xl p-6 shadow-2xl border-2 w-full max-h-[90vh] overflow-hidden relative"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            minWidth: '320px',
            maxWidth: '420px',
            boxShadow: '0 0 20px rgba(231, 116, 240, 0.3), inset 0 0 20px rgba(231, 116, 240, 0.1)'
          }}
        >
          <LogoHeader />
          
          {/* Debug info in development */}
          {import.meta.env.DEV && user && (
            <div className="mb-4 p-2 bg-gray-800/50 rounded text-xs text-gray-300 text-center">
              {user.isAdmin ? 'Admin' : `PIN ${user.pin}`} | {user.email}
              <button 
                onClick={logout}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          )}
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
            disabled={loading} 
          />
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
