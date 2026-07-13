// Tipi e helper condivisi per l'export storico timbrature (PDF/Excel)
// Funzioni normali (non hook) per evitare violazione Rules of Hooks
import { Utente } from '@/services/utenti.service';
import type { TurnoFull } from '@/services/storico/types';
import type { SessioneTimbratura } from '@/lib/storico/types';

export interface StoricoExportFilters {
  pin?: number;
  dal: string;
  al: string;
}

// Turno con dettaglio sessioni opzionale (per turni spezzati nell'export).
// Retrocompatibile: se `sessioni` manca, l'export si comporta come prima.
export type TurnoExport = TurnoFull & { sessioni?: SessioneTimbratura[] };

export interface ExportParams {
  dipendente: Utente | undefined;
  timbrature: TurnoExport[];
  filters: { pin: number; dal: string; al: string };
  toast?: (options: { title: string; description: string; variant?: 'destructive'; duration?: number }) => void;
}

/**
 * Tronca un orario a HH:MM (no secondi) per l'export. '—' o vuoto invariati.
 */
export function hhmm(time: string | null | undefined): string {
  if (!time || time === '—') return '—';
  return time.substring(0, 5);
}

/**
 * Costruisce le righe tabella per un giorno: la riga-giorno (con totali) e,
 * se il turno è spezzato, una sotto-riga per ogni sessione dalla 2ª in poi.
 * `fmt` formatta i valori numerici (string per PDF, number per Excel).
 */
export function buildRowsForGiorno(
  t: TurnoExport,
  fmt: (n: number) => string | number,
  dash: string | number
): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [];
  const sessioni = t.sessioni ?? [];
  const isSpezzato = sessioni.length > 1;

  if (!isSpezzato) {
    // Giorno con turno unico: una riga con i totali del giorno (invariato).
    rows.push([
      formatDataConGiorno(t.giorno),
      formatMeseAnno(t.giorno),
      hhmm(t.entrata),
      hhmm(t.uscita),
      fmt(t.ore || 0),
      t.extra > 0 ? fmt(t.extra) : dash,
    ]);
    return rows;
  }

  // Turno spezzato: "due righe pari" — ogni sessione su una riga, poi il totale.
  // Riga-giorno = PRIMA sessione (con la data); extra solo sulla riga totale.
  const prima = sessioni[0];
  rows.push([
    formatDataConGiorno(t.giorno),
    formatMeseAnno(t.giorno),
    hhmm(prima.entrata),
    prima.isAperta ? '—' : hhmm(prima.uscita),
    fmt(prima.ore || 0),
    dash,
  ]);
  // Sessioni successive, stesso livello.
  sessioni.slice(1).forEach((s) => {
    rows.push([
      '',
      `Sessione #${s.numeroSessione}`,
      hhmm(s.entrata),
      s.isAperta ? '—' : hhmm(s.uscita),
      fmt(s.ore || 0),
      dash,
    ]);
  });
  // Riga totale del giorno: ore totali + extra calcolato sul TOTALE del giorno.
  rows.push([
    '',
    'Totale giorno',
    '',
    '',
    fmt(t.ore || 0),
    t.extra > 0 ? fmt(t.extra) : dash,
  ]);
  return rows;
}

/**
 * Formatta data con giorno della settimana (es: "01 Lunedì")
 */
export function formatDataConGiorno(dataISO: string): string {
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const date = new Date(dataISO + 'T00:00:00');
  const giorno = String(date.getDate()).padStart(2, '0');
  const nomGiorno = giorni[date.getDay()];
  return `${giorno} ${nomGiorno}`;
}

/**
 * Formatta mese e anno (es: "Ottobre 2025")
 */
export function formatMeseAnno(dataISO: string): string {
  const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const date = new Date(dataISO + 'T00:00:00');
  const mese = mesi[date.getMonth()];
  const anno = date.getFullYear();
  return `${mese} ${anno}`;
}
