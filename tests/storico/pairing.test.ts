// Test della logica pura di pairing timbrature (storico).
// Copre i casi critici citati nel DNA: coppia chiusa, entrata senza uscita
// (riga rossa), uscita orfana, sessioni multiple, calcolo durata e totali.

import { describe, it, expect } from 'vitest';
import {
  pairTimbrature,
  buildDailyTotals,
  secondsToHours,
  hoursToSeconds,
} from '../../client/src/utils/timbrature-pairing';
import type { TimbraturaCanon } from '../../shared/types/timbrature';

function t(
  partial: Partial<TimbraturaCanon> & {
    id: number;
    tipo: 'entrata' | 'uscita';
    created_at: string;
  }
): TimbraturaCanon {
  return {
    pin: 1,
    data_locale: '2026-06-01',
    ora_locale: '08:00:00',
    giorno_logico: '2026-06-01',
    ts_order: partial.created_at,
    ...partial,
  };
}

describe('pairTimbrature', () => {
  it('accoppia una entrata con la sua uscita e calcola la durata', () => {
    const rows = [
      t({ id: 1, tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' }),
      t({ id: 2, tipo: 'uscita', created_at: '2026-06-01T12:00:00.000Z' }),
    ];
    const pairs = pairTimbrature(rows);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].entrata?.id).toBe(1);
    expect(pairs[0].uscita?.id).toBe(2);
    expect(pairs[0].durata_sec).toBe(4 * 3600);
  });

  it('lascia una entrata senza uscita come coppia aperta (riga rossa)', () => {
    const rows = [t({ id: 1, tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' })];
    const pairs = pairTimbrature(rows);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].entrata?.id).toBe(1);
    expect(pairs[0].uscita).toBeUndefined();
    expect(pairs[0].durata_sec).toBeUndefined();
  });

  it('registra una uscita senza entrata di ancoraggio', () => {
    const rows = [t({ id: 1, tipo: 'uscita', created_at: '2026-06-01T12:00:00.000Z' })];
    const pairs = pairTimbrature(rows);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].entrata).toBeUndefined();
    expect(pairs[0].uscita?.id).toBe(1);
  });

  it('gestisce sessioni multiple nello stesso giorno logico', () => {
    const rows = [
      t({ id: 1, tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' }),
      t({ id: 2, tipo: 'uscita', created_at: '2026-06-01T12:00:00.000Z' }),
      t({ id: 3, tipo: 'entrata', created_at: '2026-06-01T13:00:00.000Z' }),
      t({ id: 4, tipo: 'uscita', created_at: '2026-06-01T17:00:00.000Z' }),
    ];
    const pairs = pairTimbrature(rows);
    expect(pairs).toHaveLength(2);
    expect(pairs[0].durata_sec).toBe(4 * 3600);
    expect(pairs[1].durata_sec).toBe(4 * 3600);
  });

  it('due entrate consecutive: la prima resta aperta, la seconda si chiude', () => {
    const rows = [
      t({ id: 1, tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' }),
      t({ id: 2, tipo: 'entrata', created_at: '2026-06-01T09:00:00.000Z' }),
      t({ id: 3, tipo: 'uscita', created_at: '2026-06-01T12:00:00.000Z' }),
    ];
    const pairs = pairTimbrature(rows);
    expect(pairs).toHaveLength(2);
    expect(pairs[0].entrata?.id).toBe(1);
    expect(pairs[0].uscita).toBeUndefined();
    expect(pairs[1].entrata?.id).toBe(2);
    expect(pairs[1].uscita?.id).toBe(3);
  });

  it('separa pin e giorni logici diversi in coppie distinte', () => {
    const rows = [
      t({ id: 1, pin: 1, giorno_logico: '2026-06-01', tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' }),
      t({ id: 2, pin: 1, giorno_logico: '2026-06-01', tipo: 'uscita', created_at: '2026-06-01T12:00:00.000Z' }),
      t({ id: 3, pin: 2, giorno_logico: '2026-06-01', tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' }),
      t({ id: 4, pin: 1, giorno_logico: '2026-06-02', tipo: 'entrata', created_at: '2026-06-02T08:00:00.000Z' }),
    ];
    const pairs = pairTimbrature(rows);
    expect(pairs).toHaveLength(3);
  });

  it('non produce durate negative se i timestamp sono fuori ordine', () => {
    // uscita con created_at precedente all'entrata -> durata clampata a 0
    const rows = [
      t({ id: 1, tipo: 'entrata', created_at: '2026-06-01T12:00:00.000Z', ts_order: '2026-06-01T08:00:00.000Z' }),
      t({ id: 2, tipo: 'uscita', created_at: '2026-06-01T08:00:00.000Z', ts_order: '2026-06-01T12:00:00.000Z' }),
    ];
    const pairs = pairTimbrature(rows);
    expect(pairs[0].durata_sec).toBe(0);
  });
});

describe('buildDailyTotals', () => {
  it('somma solo le coppie chiuse nel totale giornaliero', () => {
    const rows = [
      t({ id: 1, tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' }),
      t({ id: 2, tipo: 'uscita', created_at: '2026-06-01T12:00:00.000Z' }),
      t({ id: 3, tipo: 'entrata', created_at: '2026-06-01T13:00:00.000Z' }), // aperta, non conta
    ];
    const totals = buildDailyTotals(pairTimbrature(rows));
    expect(totals).toHaveLength(1);
    expect(totals[0].ore_totali_sec).toBe(4 * 3600);
  });

  it('aggrega più sessioni dello stesso giorno in un unico totale', () => {
    const rows = [
      t({ id: 1, tipo: 'entrata', created_at: '2026-06-01T08:00:00.000Z' }),
      t({ id: 2, tipo: 'uscita', created_at: '2026-06-01T12:00:00.000Z' }),
      t({ id: 3, tipo: 'entrata', created_at: '2026-06-01T13:00:00.000Z' }),
      t({ id: 4, tipo: 'uscita', created_at: '2026-06-01T17:00:00.000Z' }),
    ];
    const totals = buildDailyTotals(pairTimbrature(rows));
    expect(totals).toHaveLength(1);
    expect(totals[0].ore_totali_sec).toBe(8 * 3600);
  });
});

describe('conversioni ore/secondi', () => {
  it('secondsToHours e hoursToSeconds sono inverse', () => {
    expect(secondsToHours(3600)).toBe(1);
    expect(hoursToSeconds(1)).toBe(3600);
    expect(secondsToHours(hoursToSeconds(7.5))).toBe(7.5);
  });
});
