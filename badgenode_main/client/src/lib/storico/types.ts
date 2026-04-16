// Tipi per gestione multi-sessione giorno logico

/**
 * Singola sessione di lavoro (Entrata → Uscita)
 */
export interface SessioneTimbratura {
  numeroSessione: number;
  entrata: string | null; // "HH:MM:SS" formato
  uscita: string | null; // "HH:MM:SS" o null se sessione aperta
  ore: number; // Ore sessione (0 se aperta)
  isAperta: boolean; // true se uscita mancante
}

/**
 * Giorno logico con dettaglio sessioni
 * Compatibile con TurnoFull esistente + array sessioni
 */
export interface GiornoLogicoDettagliato {
  pin: number;
  giorno: string; // YYYY-MM-DD
  mese_label: string; // "October 2025"
  // Riepilogo giorno (compatibilità con TurnoFull)
  entrata: string | null; // Prima entrata del giorno
  uscita: string | null; // Ultima uscita del giorno
  ore: number; // Totale ore giorno (somma sessioni chiuse)
  extra: number; // Ore extra giorno
  // NUOVO: Dettaglio sessioni
  sessioni: SessioneTimbratura[];
}

/**
 * Riga dataset per rendering tabella con sotto-righe
 */
export interface StoricoRowData {
  type: 'giorno' | 'sessione';
  giorno?: GiornoLogicoDettagliato; // Se type='giorno'
  sessione?: SessioneTimbratura; // Se type='sessione'
  giornoParent?: string; // Se type='sessione', riferimento giorno YYYY-MM-DD
}
