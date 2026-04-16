import { TimbratureService } from '@/services/timbrature.service';
import { invalidateAfterTimbratura } from '@/state/timbrature.cache';
import { safeFetchJson } from '@/lib/safeFetch';
import { isError } from '@/types/api';
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
  // Validazione PIN online tramite API; offline → consenti per non bloccare
  const validatePIN = async (pinNumber: number, tipo: 'entrata' | 'uscita', traceId?: string): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        logTimbraturaDiag('pin.validate_result', {
          traceId,
          pin: pinNumber,
          tipo,
          source: 'timbrature-actions',
          result: 'allow-offline',
        });
        return true;
      }
      const resp = await safeFetchJson<{ ok: boolean }>(`/api/pin/validate?pin=${encodeURIComponent(pinNumber)}`, {
        headers: traceId ? { 'x-badgenode-trace': traceId } : undefined,
      });
      if (resp.success === true && resp.data?.ok === true) {
        logTimbraturaDiag('pin.validate_result', {
          traceId,
          pin: pinNumber,
          tipo,
          source: 'timbrature-actions',
          result: 'valid',
        });
        return true;
      }
      if (isError(resp) && (resp.code === 'NOT_FOUND' || resp.code === 'PIN_NOT_FOUND')) {
        logTimbraturaDiag('pin.validate_result', {
          traceId,
          pin: pinNumber,
          tipo,
          source: 'timbrature-actions',
          result: 'not-found',
        });
        return false;
      }
      // In caso di 4xx diverso/5xx → fallback conservativo: non bloccare, lascia a TimbratureService l'esito
      logTimbraturaDiag('pin.validate_result', {
        traceId,
        pin: pinNumber,
        tipo,
        source: 'timbrature-actions',
        result: 'fallback-allow',
        response: resp,
      });
      return true;
    } catch {
      // Errori di rete → non bloccare il flusso (TimbratureService gestirà offline/queue)
      logTimbraturaDiag('pin.validate_result', {
        traceId,
        pin: pinNumber,
        tipo,
        source: 'timbrature-actions',
        result: 'network-fallback-allow',
      });
      return true;
    }
  };

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

      // VALIDAZIONE PIN LOCALE - Verifica esistenza prima di timbrare
      const isPinValid = await validatePIN(pinNumber, 'entrata', traceId);
      if (!isPinValid) {
        logTimbraturaDiag('action.blocked_invalid_pin', {
          traceId,
          pin: pinNumber,
          tipo: 'entrata',
          source: 'timbrature-actions',
          userMessage: 'PIN non registrato nel sistema',
        });
        setFeedback({ type: 'error', message: 'PIN non registrato nel sistema' });
        setLoading(false);
        setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
        return;
      }

      const res = await TimbratureService.timbra(pinNumber, 'entrata', traceId, {
        skipValidation: true,
      });
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
        const msg = res.message || res.code || 'Errore registrazione Entrata';
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

      // VALIDAZIONE PIN LOCALE - Verifica esistenza prima di timbrare
      const isPinValid = await validatePIN(pinNumber, 'uscita', traceId);
      if (!isPinValid) {
        logTimbraturaDiag('action.blocked_invalid_pin', {
          traceId,
          pin: pinNumber,
          tipo: 'uscita',
          source: 'timbrature-actions',
          userMessage: 'PIN non registrato nel sistema',
        });
        setFeedback({ type: 'error', message: 'PIN non registrato nel sistema' });
        setLoading(false);
        setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
        return;
      }

      const res = await TimbratureService.timbra(pinNumber, 'uscita', traceId, {
        skipValidation: true,
      });
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
        const msg = res.message || res.code || 'Errore registrazione Uscita';
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
