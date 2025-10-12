import { ReactNode } from 'react';
import LogoHeader from '@/components/home/LogoHeader';
import PinDisplay from '@/components/home/PinDisplay';
import Keypad from '@/components/home/Keypad';
import DateTimeLive from '@/components/home/DateTimeLive';
import ActionButtons from '@/components/home/ActionButtons';
import FeedbackBanner from '@/components/FeedbackBanner';

interface HomeContainerProps {
  pin: string;
  feedback: { type: 'success' | 'error' | null; message: string };
  loading: boolean;
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onSettings: () => void;
  onEntrata: () => void;
  onUscita: () => void;
  onFeedbackClose: () => void;
  children?: ReactNode;
}

export default function HomeContainer({
  pin,
  feedback,
  loading,
  onKeyPress,
  onClear,
  onSettings,
  onEntrata,
  onUscita,
  onFeedbackClose,
  children,
}: HomeContainerProps) {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center p-4 overflow-hidden fixed inset-0"
      style={{
        background: 'radial-gradient(ellipse at center, #2d1b3d 0%, #1a0f2e 50%, #0f0a1a 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-sm md:max-w-md flex items-center justify-center">
        <div
          className="rounded-3xl p-6 shadow-2xl border-2 w-full max-h-[90vh] overflow-hidden relative"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            minWidth: '320px',
            maxWidth: '420px',
            boxShadow: '0 0 20px rgba(231, 116, 240, 0.3), inset 0 0 20px rgba(231, 116, 240, 0.1)',
          }}
        >
          <LogoHeader />

          <PinDisplay pin={pin} />

          {/* Messaggio feedback sotto il PIN */}
          <FeedbackBanner
            type={feedback.type}
            message={feedback.message}
            onClose={onFeedbackClose}
          />

          <Keypad onKeyPress={onKeyPress} onClear={onClear} onSettings={onSettings} />
          <DateTimeLive />
          <ActionButtons onEntrata={onEntrata} onUscita={onUscita} disabled={loading} />
        </div>
      </div>

      {children}
    </div>
  );
}
