import { ReactNode, useEffect, useState } from 'react';
import LogoHeader from '@/components/home/LogoHeader';
import PinDisplay from '@/components/home/PinDisplay';
import Keypad from '@/components/home/Keypad';
import DateTimeLive from '@/components/home/DateTimeLive';
import ActionButtons from '@/components/home/ActionButtons';
import ToastCard from '@/components/ui/ToastCard';
import { UtentiService } from '@/services/utenti.service';

interface HomeContainerProps {
  pin: string;
  lastPin?: string;
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
  lastPin,
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
  const [nome, setNome] = useState<string | undefined>(undefined);
  const [cognome, setCognome] = useState<string | undefined>(undefined);

  // Fetch nominativo per mostrare Nome Cognome nel toast quando c'è un successo
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (feedback.type === 'success' && lastPin && /^\d+$/.test(lastPin)) {
        const u = await UtentiService.getUtenteByPin(Number(lastPin));
        if (!cancelled) {
          setNome(u?.nome || undefined);
          setCognome(u?.cognome || undefined);
        }
      } else {
        if (!cancelled) {
          setNome(undefined);
          setCognome(undefined);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [feedback.type, lastPin]);
  const variant = feedback.type === 'success'
    ? (feedback.message?.toLowerCase().includes('uscita') ? 'success-uscita' : 'success-entrata')
    : feedback.type === 'error'
    ? 'error'
    : undefined;

  const timestampText = feedback.type
    ? (() => {
        const d = new Date();
        const hh = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false });
        const day = d.toLocaleString('it-IT', { day: '2-digit' });
        const month = d.toLocaleString('it-IT', { month: 'long' });
        return `alle ore ${hh} del ${day} ${month}`;
      })()
    : undefined;

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

          {/* Messaggio elegante sotto il PIN (UI-only) */}
          <ToastCard
            open={Boolean(feedback.type)}
            variant={(variant as any) || 'error'}
            timestampText={timestampText}
            messageOverride={feedback.type === 'success' ? (feedback.message?.toLowerCase().includes('uscita') ? 'USCITA Registrata!' : 'ENTRATA Registrata!') : feedback.message}
            nome={nome}
            cognome={cognome}
            onClose={onFeedbackClose}
            inline
            showClose={false}
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
