// Tipi per sistema timbrature BadgeNode
// Allineati alle nuove colonne DB: giorno_logico, data_locale, ora_locale

export type Timbratura = {
  id: number;
  pin: number;
  tipo: 'entrata' | 'uscita';
  ts_order: string; // ISO timestamp UTC
  giorno_logico: string; // 'YYYY-MM-DD'
  data_locale: string | null; // opzionale
  ora_locale: string | null; // opzionale
  client_event_id?: string | null;
  // Campi legacy per compatibilità UI
  nome?: string;
  cognome?: string;
  created_at?: string;
};

export type StoricoParams = {
  pin: number;
  from?: string; // 'YYYY-MM-DD'
  to?: string; // 'YYYY-MM-DD'
};
