type ActionType = 'entrata' | 'uscita';

interface TimbraturaDiagPayload {
  traceId?: string;
  pin?: string | number | null;
  tipo?: ActionType;
  source?: string;
  [key: string]: unknown;
}

// Diagnostica temporanea client-side per correlare i tentativi di timbratura.
export function createTimbraturaTraceId(pin: string | number, tipo: ActionType): string {
  return `td-${Date.now()}-${String(pin)}-${tipo}`;
}

export function logTimbraturaDiag(event: string, payload: TimbraturaDiagPayload = {}): void {
  if (!import.meta.env.DEV) return;

  const enriched = {
    ts: new Date().toISOString(),
    ...payload,
  };

  console.info(`[TIMBRATURA_DIAG][${event}]`, enriched);
}
