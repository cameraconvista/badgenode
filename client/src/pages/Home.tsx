import { useState } from 'react';
import Keypad from '@/components/Keypad';
import PinDisplay from '@/components/PinDisplay';
import DateTimeLive from '@/components/DateTimeLive';
import ActionButtons from '@/components/ActionButtons';
import FeedbackBanner from '@/components/FeedbackBanner';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [pin, setPin] = useState('');
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
    console.log('Settings clicked');
    setFeedback({ type: 'success', message: 'Impostazioni - Funzionalità in arrivo' });
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
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
      setPin('');
    }
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FeedbackBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, message: '' })}
      />

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight" data-testid="text-logo">
              <span className="text-ring">BADGE</span>
              <span className="text-foreground">NODE</span>
            </h1>
          </div>

          <PinDisplay pin={pin} />

          <Keypad onKeyPress={handleKeyPress} onClear={handleClear} onSettings={handleSettings} />

          <DateTimeLive />

          <ActionButtons onEntrata={handleEntrata} onUscita={handleUscita} disabled={false} />
        </Card>
      </div>
    </div>
  );
}
