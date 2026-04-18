import { safeFetchJson } from '@/lib/safeFetch';
import { isError, isSuccess } from '@/types/api';
import { logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';

export async function validatePinApi(
  pin: number,
  tipo: 'entrata' | 'uscita',
  traceId?: string
): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      logTimbraturaDiag('pin.validate_service_result', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-service',
        result: 'allow-offline',
      });
      return true;
    }
    const resp = await safeFetchJson<{ ok: boolean }>(`/api/pin/validate?pin=${encodeURIComponent(pin)}`, {
      cache: 'no-store',
      headers: traceId ? { 'x-badgenode-trace': traceId } : undefined,
    });
    if (isError(resp)) {
      logTimbraturaDiag('pin.validate_service_result', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-service',
        result: 'not-valid',
        code: resp.code,
        error: resp.error,
      });
      return false;
    }
    let okValue: boolean | undefined;
    if (isSuccess(resp)) {
      okValue = resp.data?.ok;
    }
    if (okValue === undefined) {
      const flat = (resp as unknown as { ok?: unknown }).ok;
      okValue = typeof flat === 'boolean' ? flat : undefined;
    }
    const ok = okValue === true;
    logTimbraturaDiag('pin.validate_service_result', {
      traceId,
      pin,
      tipo,
      source: 'timbrature-service',
      result: ok === true ? 'valid' : 'fallback-invalid',
    });
    return ok === true;
  } catch (e) {
    logTimbraturaDiag('pin.validate_service_result', {
      traceId,
      pin,
      tipo,
      source: 'timbrature-service',
      result: 'network-fallback-allow',
      error: (e as Error).message,
    });
    return true;
  }
}
