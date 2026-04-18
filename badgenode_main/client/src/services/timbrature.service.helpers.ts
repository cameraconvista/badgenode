import type { Timbratura } from '@/types/timbrature';
import type { TimbraturaCanon } from '../../../shared/types/timbrature';

export function toLegacyTimbratura(t: TimbraturaCanon): Timbratura {
  return {
    id: t.id,
    pin: t.pin,
    tipo: t.tipo,
    data_locale: t.data_locale,
    ora_locale: t.ora_locale,
    giorno_logico: t.giorno_logico,
    ts_order: t.ts_order,
    nome: '',
    cognome: '',
    created_at: t.created_at,
  };
}

export function sortByCreatedAtDesc<T extends { created_at: string }>(items: T[]): T[] {
  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function normalizeTimbraResult(result: { success: boolean; data?: unknown; code?: string; error?: string }) {
  const payload = (result.data ?? {}) as { id?: unknown };
  const id = typeof payload.id === 'number' ? payload.id : undefined;
  return { id, code: result.code, error: result.error, success: result.success };
}
