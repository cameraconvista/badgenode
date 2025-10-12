// Tipi globali per il sistema timbrature BadgeNode
// Data source unica: public.v_timbrature_canon

export type TimbraturaCanon = {
  id: number;
  pin: number;
  tipo: 'entrata' | 'uscita';
  created_at: string; // ISO tz
  data_locale: string; // 'YYYY-MM-DD'
  ora_locale: string; // 'HH:MM:SS[.ms]'
  giorno_logico: string; // 'YYYY-MM-DD'
  ts_order: string; // ISO tz
};

export type TimbraturaPair = {
  pin: number;
  giorno_logico: string; // 'YYYY-MM-DD'
  entrata?: TimbraturaCanon; // opzionale
  uscita?: TimbraturaCanon; // opzionale
  durata_sec?: number; // presente se entrambi
};

export type DailyTotal = {
  pin: number;
  giorno_logico: string;
  ore_totali_sec: number;
  ore_extra_sec: number; // TODO: definire standard giornaliero
};

export type TimbratureRangeParams = {
  pin?: number;
  from?: string; // 'YYYY-MM-DD'
  to?: string; // 'YYYY-MM-DD'
};
