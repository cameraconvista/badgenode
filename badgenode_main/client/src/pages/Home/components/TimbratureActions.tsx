import { TimbratureService } from '@/services/timbrature.service';
import { invalidateAfterTimbratura } from '@/state/timbrature.cache';
import { logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';

interface TimbratureActionsProps {
  pin: string;
  setPin: (pin: string) => void;
  setLoading: (loading: boolean) => void;
  setFeedback: (feedback: { type: 'success' | 'error' | null; message: string }) => void;
}

export function useTimbratureActions({
  pin,
  setPin,
  setLoading,
  setFeedback,
}: TimbratureActionsProps) {
  const handleEntrata = async (traceId?: string) => {
    if (pin.length === 0) {
      logTimbraturaDiag('action.rejected_empty_pin', {
        traceId,
        pin,
        tipo: 'entrata',
        source: 'timbrature-actions',
      });
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
      return;
    }

    setLoading(true);
    try {
      const pinNumber = Number(pin);
      logTimbraturaDiag('action.start', {
        traceId,
        pin: pinNumber,
        tipo: 'entrata',
        source: 'timbrature-actions',
      });

      const res = await TimbratureService.timbra(pinNumber, 'entrata', traceId);
      logTimbraturaDiag('action.service_result', {
        traceId,
        pin: pinNumber,
        tipo: 'entrata',
        source: 'timbrature-service',
        ok: res.ok,
        code: res.code,
        message: res.message,
        id: res.id,
      });
      if (res.ok) {
        invalidateAfterTimbratura(pinNumber);
        logTimbraturaDiag('action.feedback_success', {
          traceId,
          pin: pinNumber,
          tipo: 'entrata',
          source: 'timbrature-actions',
          userMessage: 'Entrata registrata',
          id: res.id,
        });
        setFeedback({ type: 'success', message: 'Entrata registrata' });
        setPin('');
      } else {
        const msg =
          res.code === 'PIN_NOT_FOUND'
            ? 'PIN non registrato nel sistema'
            : res.message || res.code || 'Errore registrazione Entrata';
        logTimbraturaDiag('action.feedback_error', {
          traceId,
          pin: pinNumber,
          tipo: 'entrata',
          source: 'timbrature-actions',
          userMessage: msg,
        });
        setFeedback({ type: 'error', message: msg });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante la registrazione';
      logTimbraturaDiag('action.exception', {
        traceId,
        pin,
        tipo: 'entrata',
        source: 'timbrature-actions',
        message,
      });
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
    }
  };

  const handleUscita = async (traceId?: string) => {
    if (pin.length === 0) {
      logTimbraturaDiag('action.rejected_empty_pin', {
        traceId,
        pin,
        tipo: 'uscita',
        source: 'timbrature-actions',
      });
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
      return;
    }

    setLoading(true);
    try {
      const pinNumber = Number(pin);
      logTimbraturaDiag('action.start', {
        traceId,
        pin: pinNumber,
        tipo: 'uscita',
        source: 'timbrature-actions',
      });

      const res = await TimbratureService.timbra(pinNumber, 'uscita', traceId);
      logTimbraturaDiag('action.service_result', {
        traceId,
        pin: pinNumber,
        tipo: 'uscita',
        source: 'timbrature-service',
        ok: res.ok,
        code: res.code,
        message: res.message,
        id: res.id,
      });
      if (res.ok) {
        invalidateAfterTimbratura(pinNumber);
        logTimbraturaDiag('action.feedback_success', {
          traceId,
          pin: pinNumber,
          tipo: 'uscita',
          source: 'timbrature-actions',
          userMessage: 'Uscita registrata',
          id: res.id,
        });
        setFeedback({ type: 'success', message: 'Uscita registrata' });
        setPin('');
      } else {
        const msg =
          res.code === 'PIN_NOT_FOUND'
            ? 'PIN non registrato nel sistema'
            : res.message || res.code || 'Errore registrazione Uscita';
        logTimbraturaDiag('action.feedback_error', {
          traceId,
          pin: pinNumber,
          tipo: 'uscita',
          source: 'timbrature-actions',
          userMessage: msg,
        });
        setFeedback({ type: 'error', message: msg });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante la registrazione';
      logTimbraturaDiag('action.exception', {
        traceId,
        pin,
        tipo: 'uscita',
        source: 'timbrature-actions',
        message,
      });
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
    }
  };

  return {
    handleEntrata,
    handleUscita,
  };
}
