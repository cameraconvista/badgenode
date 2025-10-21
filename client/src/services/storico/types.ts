// Tipi per servizio storico BadgeNode

export type TurnoGiornaliero = {
  pin: number;
  giorno: string; // ISO date (YYYY-MM-DD)
  mese_label: string; // "October 2025" (fornita dal DB)
  entrata: string | null; // "HH:MM:SS" o null
  uscita: string | null; // "HH:MM:SS" o null
  ore: number; // ore decimali
  extra: number; // ore extra decimali
};

// Tipi per viste v5
export type SessioneV5 = {
  entrata_id: number;
  entrata_ore: string | null; // HH:MM:SS o null per compatibilità
  uscita_id: number | null;
  uscita_ore: string | null;
  ore_sessione: number;
  sessione_num: number;
};

export type TotaleGiornoV5 = {
  giorno_logico: string; // YYYY-MM-DD
  ore_totali_chiuse: number;
  sessioni_chiuse: number;
  sessioni_totali: number;
};

export type StoricoDatasetV5 = {
  giorno_logico: string;
  ore_totali_chiuse: number;
  sessioni: SessioneV5[];
};

export type TurnoFull = {
  pin: number;
  giorno: string; // 'YYYY-MM-DD'
  mese_label: string; // 'October 2025'
  entrata: string | null; // 'HH:MM:SS.sss' | null
  uscita: string | null; // 'HH:MM:SS.sss' | null
  ore: number; // ore decimali
  extra: number; // ore decimali
};
