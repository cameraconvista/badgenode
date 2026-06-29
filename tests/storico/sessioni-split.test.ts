// Test della visualizzazione multi-sessione (turni spezzati).
// Copre i casi verificati empiricamente su PIN 99 il 2026-06-29:
// spezzato semplice, triplo, a cavallo di mezzanotte, sessione aperta.
// Verifica due invarianti: (1) il pairing produce le sessioni attese,
// (2) la somma delle ore delle sessioni chiuse = totale giorno (mai alterato).

import { describe, it, expect } from 'vitest';
import { pairSessionsForGiorno, calculateSessionHours } from '../../client/src/lib/storico/pairing';
import { aggregateTimbratureByGiornoLogico } from '../../client/src/lib/storico/aggregate';

type Raw = {
  pin: number;
  tipo: 'entrata' | 'uscita';
  ore: string;
  giorno_logico: string;
  created_at: string;
};

// Helper: costruisce un record grezzo. created_at riflette l'ordine reale degli eventi.
function r(tipo: 'entrata' | 'uscita', ora: string, createdAt: string, giorno = '2026-06-10'): Raw {
  return { pin: 99, tipo, ore: ora, giorno_logico: giorno, created_at: createdAt };
}

describe('pairSessionsForGiorno — turni spezzati', () => {
  it('spezzato semplice: 09-15 + 19-23 = 2 sessioni (6h + 4h)', () => {
    const rows = [
      r('entrata', '09:00:00', '2026-06-10T07:00:00.000Z'),
      r('uscita', '15:00:00', '2026-06-10T13:00:00.000Z'),
      r('entrata', '19:00:00', '2026-06-10T17:00:00.000Z'),
      r('uscita', '23:00:00', '2026-06-10T21:00:00.000Z'),
    ];
    const s = pairSessionsForGiorno(rows);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({ entrata: '09:00:00', uscita: '15:00:00', ore: 6, isAperta: false });
    expect(s[1]).toMatchObject({ entrata: '19:00:00', uscita: '23:00:00', ore: 4, isAperta: false });
  });

  it('triplo spezzato: 08-11 + 13-16 + 18-21 = 3 sessioni (3h ciascuna)', () => {
    const rows = [
      r('entrata', '08:00:00', '2026-06-16T06:00:00.000Z'),
      r('uscita', '11:00:00', '2026-06-16T09:00:00.000Z'),
      r('entrata', '13:00:00', '2026-06-16T11:00:00.000Z'),
      r('uscita', '16:00:00', '2026-06-16T14:00:00.000Z'),
      r('entrata', '18:00:00', '2026-06-16T16:00:00.000Z'),
      r('uscita', '21:00:00', '2026-06-16T19:00:00.000Z'),
    ];
    const s = pairSessionsForGiorno(rows);
    expect(s).toHaveLength(3);
    expect(s.every((x) => x.ore === 3 && !x.isAperta)).toBe(true);
  });

  it('caso chef tipico: 09-13 + 17-02 = 2 sessioni (4h + 9h = 13h)', () => {
    // Spezzato reale: mattina 09-13, sera 17 fino alle 02 del giorno dopo.
    // L'uscita 02:00 ha created_at successivo all'entrata 17:00.
    const rows = [
      r('entrata', '09:00:00', '2026-06-10T07:00:00.000Z'),
      r('uscita', '13:00:00', '2026-06-10T11:00:00.000Z'),
      r('entrata', '17:00:00', '2026-06-10T15:00:00.000Z'),
      r('uscita', '02:00:00', '2026-06-11T00:00:00.000Z'),
    ];
    const s = pairSessionsForGiorno(rows);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({ entrata: '09:00:00', uscita: '13:00:00', ore: 4, isAperta: false });
    expect(s[1]).toMatchObject({ entrata: '17:00:00', uscita: '02:00:00', ore: 9, isAperta: false });
  });

  it('a cavallo di mezzanotte: 18-21 + 22-01:30 (REGRESSIONE bug ordinamento HH:MM)', () => {
    // L'uscita 01:30 ha created_at successivo all'entrata 22:00 (è la notte dopo).
    // Ordinando per stringa HH:MM la 01:30 finirebbe in cima e romperebbe il pairing.
    const rows = [
      r('entrata', '18:00:00', '2026-06-12T16:00:00.000Z', '2026-06-12'),
      r('uscita', '21:00:00', '2026-06-12T19:00:00.000Z', '2026-06-12'),
      r('entrata', '22:00:00', '2026-06-12T20:00:00.000Z', '2026-06-12'),
      r('uscita', '01:30:00', '2026-06-12T23:30:00.000Z', '2026-06-12'),
    ];
    const s = pairSessionsForGiorno(rows);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({ entrata: '18:00:00', uscita: '21:00:00', isAperta: false });
    // La sessione serale DEVE chiudersi con l'uscita dopo mezzanotte, non restare aperta.
    expect(s[1]).toMatchObject({ entrata: '22:00:00', uscita: '01:30:00', isAperta: false });
    expect(s[1].ore).toBe(3.5); // 22:00 -> 01:30 = 3.5h (rollover gestito)
  });

  it('sessione aperta: 09-12 chiusa + 14 entrata senza uscita', () => {
    const rows = [
      r('entrata', '09:00:00', '2026-06-18T07:00:00.000Z'),
      r('uscita', '12:00:00', '2026-06-18T10:00:00.000Z'),
      r('entrata', '14:00:00', '2026-06-18T12:00:00.000Z'),
    ];
    const s = pairSessionsForGiorno(rows);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({ entrata: '09:00:00', uscita: '12:00:00', ore: 3, isAperta: false });
    expect(s[1]).toMatchObject({ entrata: '14:00:00', uscita: null, ore: 0, isAperta: true });
  });

  it('non muta l\'array in ingresso', () => {
    const rows = [
      r('uscita', '12:00:00', '2026-06-10T10:00:00.000Z'),
      r('entrata', '09:00:00', '2026-06-10T07:00:00.000Z'),
    ];
    const copy = JSON.stringify(rows);
    pairSessionsForGiorno(rows);
    expect(JSON.stringify(rows)).toBe(copy);
  });
});

describe('calculateSessionHours — rollover notturno', () => {
  it('22:00 -> 01:30 = 3.5h (aggiunge 24h quando uscita < entrata)', () => {
    expect(calculateSessionHours('22:00:00', '01:30:00', '2026-06-12')).toBe(3.5);
  });
  it('09:00 -> 17:00 = 8h (turno diurno)', () => {
    expect(calculateSessionHours('09:00:00', '17:00:00', '2026-06-10')).toBe(8);
  });
});

describe('invariante: somma sessioni chiuse = totale giorno', () => {
  it('spezzato 09-15 + 19-23: aggregato riporta ore=10 e 2 sessioni', () => {
    const rows = [
      r('entrata', '09:00:00', '2026-06-10T07:00:00.000Z'),
      r('uscita', '15:00:00', '2026-06-10T13:00:00.000Z'),
      r('entrata', '19:00:00', '2026-06-10T17:00:00.000Z'),
      r('uscita', '23:00:00', '2026-06-10T21:00:00.000Z'),
    ];
    const giorni = aggregateTimbratureByGiornoLogico(rows, 99, 8);
    expect(giorni).toHaveLength(1);
    const g = giorni[0];
    expect(g.ore).toBe(10);
    expect(g.sessioni).toHaveLength(2);
    // L'invariante chiave: il totale è esattamente la somma delle sessioni chiuse.
    const sommaSessioni = g.sessioni
      .filter((s) => !s.isAperta)
      .reduce((acc, s) => acc + s.ore, 0);
    expect(sommaSessioni).toBe(g.ore);
    // Riepilogo: prima entrata e ultima uscita.
    expect(g.entrata).toBe('09:00:00');
    expect(g.uscita).toBe('23:00:00');
  });

  it('sessione aperta non gonfia il totale (09-12 chiusa + 14 aperta = 3h)', () => {
    const rows = [
      r('entrata', '09:00:00', '2026-06-18T07:00:00.000Z', '2026-06-18'),
      r('uscita', '12:00:00', '2026-06-18T10:00:00.000Z', '2026-06-18'),
      r('entrata', '14:00:00', '2026-06-18T12:00:00.000Z', '2026-06-18'),
    ];
    const giorni = aggregateTimbratureByGiornoLogico(rows, 99, 8);
    expect(giorni[0].ore).toBe(3);
    expect(giorni[0].sessioni).toHaveLength(2);
  });
});
