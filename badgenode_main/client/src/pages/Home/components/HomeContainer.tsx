import { ReactNode, useEffect, useState } from 'react';
import LogoHeader from '@/components/home/LogoHeader';
import PinDisplay from '@/components/home/PinDisplay';
import Keypad from '@/components/home/Keypad';
import DateTimeLive from '@/components/home/DateTimeLive';
import ActionButtons from '@/components/home/ActionButtons';
import ToastCard from '@/components/ui/ToastCard';
import { UtentiService } from '@/services/utenti.service';
import { logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';
import { useQueryClient } from '@tanstack/react-query';
import type { ToastVariant } from '@/components/ui/ToastCard';

interface HomeContainerProps {
  pin: string;
  lastPin?: string;
  lastTraceId?: string;
  feedback: { type: 'success' | 'error' | null; message: string };
  loading: boolean;
  disabledEntrata?: boolean;
  disabledUscita?: boolean;
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
  lastTraceId,
  feedback,
  loading,
  disabledEntrata,
  disabledUscita,
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
  const queryClient = useQueryClient();

  // Fetch nominativo per mostrare Nome Cognome nel toast quando c'è un successo
  // OTTIMIZZATO: Fetch in background, toast appare immediatamente
  useEffect(() => {
    let cancelled = false;

    // Reset immediato se non è successo
    if (feedback.type !== 'success') {
      if (feedback.type === 'error') {
        logTimbraturaDiag('toast.feedback_error_state', {
          traceId: lastTraceId,
          pin: lastPin,
          source: 'home-container',
          feedbackMessage: feedback.message,
        });
      }
      setNome(undefined);
      setCognome(undefined);
      return;
    }

    // Fetch in background (non blocca visualizzazione toast)
    if (lastPin && /^\d+$/.test(lastPin)) {
      logTimbraturaDiag('toast.name_fetch_start', {
        traceId: lastTraceId,
        pin: lastPin,
        source: 'home-container',
        feedbackMessage: feedback.message,
      });
      (async () => {
        try {
          const cacheKey = ['utente', Number(lastPin)];
          const cached = queryClient.getQueryData(cacheKey) as { nome?: string; cognome?: string } | undefined;
          const u = cached ?? (await queryClient.fetchQuery({
            queryKey: cacheKey,
            queryFn: async () => await UtentiService.getUtenteByPin(Number(lastPin), lastTraceId),
            staleTime: 60_000,
          }));
          if (!cancelled) {
            setNome(u?.nome || undefined);
            setCognome(u?.cognome || undefined);
            logTimbraturaDiag('toast.name_fetch_result', {
              traceId: lastTraceId,
              pin: lastPin,
              source: 'home-container',
              found: Boolean(u),
              nome: u?.nome || null,
              cognome: u?.cognome || null,
            });
          }
        } catch {
          // Fallback silenzioso: toast appare comunque senza nome
          if (!cancelled) {
            setNome(undefined);
            setCognome(undefined);
            logTimbraturaDiag('toast.name_fetch_result', {
              traceId: lastTraceId,
              pin: lastPin,
              source: 'home-container',
              found: false,
              error: 'fetch-failed',
            });
          }
        }
      })();
    }

    return () => { cancelled = true; };
  }, [feedback.type, feedback.message, lastPin, lastTraceId]);

  useEffect(() => {
    if (!feedback.type) return;
    logTimbraturaDiag('toast.render_state', {
      traceId: lastTraceId,
      pin: lastPin,
      source: 'home-container',
      feedbackType: feedback.type,
      feedbackMessage: feedback.message,
      hasNome: Boolean(nome),
      hasCognome: Boolean(cognome),
    });
  }, [feedback.type, feedback.message, nome, cognome, lastPin, lastTraceId]);
  const variant = feedback.type === 'success'
    ? (feedback.message?.toLowerCase().includes('uscita') ? 'success-uscita' : 'success-entrata')
    : feedback.type === 'error'
    ? 'error'
    : undefined;

  const computedVariant: ToastVariant = variant ?? 'error';

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
    <div className="fixed inset-0 flex h-screen w-screen items-center justify-center overflow-auto bg-[radial-gradient(ellipse_at_center,_#F5EBE0_0%,_#F0E2D4_50%,_#E8D5C4_100%)] bg-fixed p-2 sm:p-4">
      <div className="flex w-full max-w-sm items-center justify-center md:max-w-md">
        <div className="relative h-auto max-h-[98vh] w-full min-w-[300px] max-w-[380px] sm:max-w-[420px] overflow-y-auto rounded-3xl border-2 border-[rgba(122,18,40,0.30)] bg-white p-3 sm:p-4 md:p-6 shadow-[0_8px_40px_rgba(122,18,40,0.15),_inset_0_0_0_0_transparent] origin-center sm:scale-[1.1] md:scale-[1.2]">
          <LogoHeader />

          <PinDisplay pin={pin} />
          <Keypad onKeyPress={onKeyPress} onClear={onClear} onSettings={onSettings} />
          <DateTimeLive />
          <ActionButtons
            onEntrata={onEntrata}
            onUscita={onUscita}
            disabled={loading}
            disabledEntrata={disabledEntrata}
            disabledUscita={disabledUscita}
          />
        </div>
      </div>

      {children}

      {/* Modale di conferma timbratura — appare sopra tutto */}
      <ToastCard
        open={Boolean(feedback.type)}
        variant={computedVariant}
        timestampText={timestampText}
        messageOverride={feedback.type === 'success' ? (feedback.message?.toLowerCase().includes('uscita') ? 'USCITA Registrata!' : 'ENTRATA Registrata!') : feedback.message}
        nome={nome}
        cognome={cognome}
        onClose={onFeedbackClose}
        modal
        showClose={false}
        hideTimestamp={feedback.type === 'error' && /PIN non registrato nel sistema/i.test(feedback.message)}
      />
    </div>
  );
}
