// Tipi database generati per BadgeNode (schema-first)
// Basato su: utenti, timbrature, ex_dipendenti, v_turni_giornalieri

export interface Database {
  public: {
    Tables: {
      utenti: {
        Row: {
          id: string; // UUID
          pin: number; // 1-99 UNIQUE
          nome: string;
          cognome: string;
          ore_contrattuali: number; // default 8.00
          email: string | null;
          telefono: string | null;
          created_at: string; // timestamp
          note: string | null;
        };
        Insert: {
          id?: string;
          pin: number;
          nome: string;
          cognome: string;
          ore_contrattuali?: number;
          email?: string | null;
          telefono?: string | null;
          created_at?: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          pin?: number;
          nome?: string;
          cognome?: string;
          ore_contrattuali?: number;
          email?: string | null;
          telefono?: string | null;
          created_at?: string;
          note?: string | null;
        };
      };
      timbrature: {
        Row: {
          id: number; // BIGSERIAL
          pin: number; // FK to utenti.pin
          tipo: 'entrata' | 'uscita';
          ts_order: string; // timestamp ISO
          created_at: string; // timestamp ISO
          giorno_logico: string; // DATE YYYY-MM-DD
          data_locale: string; // DATE YYYY-MM-DD
          ora_locale: string; // TIME HH:mm:ss
        };
        Insert: {
          id?: number;
          pin: number;
          tipo: 'entrata' | 'uscita';
          ts_order: string;
          created_at?: string;
          giorno_logico: string;
          data_locale: string;
          ora_locale: string;
        };
        Update: {
          id?: number;
          pin?: number;
          tipo?: 'entrata' | 'uscita';
          ts_order?: string;
          created_at?: string;
          giorno_logico?: string;
          data_locale?: string;
          ora_locale?: string;
        };
      };
      ex_dipendenti: {
        Row: {
          id: string; // UUID
          pin: number;
          nome: string;
          cognome: string;
          ore_contrattuali: number;
          email: string | null;
          telefono: string | null;
          data_archiviazione: string; // timestamp
          note: string | null;
        };
        Insert: {
          id?: string;
          pin: number;
          nome: string;
          cognome: string;
          ore_contrattuali?: number;
          email?: string | null;
          telefono?: string | null;
          data_archiviazione?: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          pin?: number;
          nome?: string;
          cognome?: string;
          ore_contrattuali?: number;
          email?: string | null;
          telefono?: string | null;
          data_archiviazione?: string;
          note?: string | null;
        };
      };
    };
    Views: {
      v_turni_giornalieri: {
        Row: {
          pin: number;
          giorno_logico: string;
          entrata: string | null; // HH:mm:ss
          uscita: string | null; // HH:mm:ss
          ore: number | null; // decimal
          extra: number | null; // decimal
          nome: string;
          cognome: string;
          ore_contrattuali: number;
        };
      };
    };
    Functions: {
      insert_timbro_v2: {
        Args: {
          p_pin: number;
          p_tipo: 'entrata' | 'uscita';
        };
        Returns: {
          id: number;
          pin: number;
          tipo: 'entrata' | 'uscita';
          giorno_logico: string;
          data_locale: string;
          ora_locale: string;
        };
      };
      upsert_utente_rpc: {
        Args: {
          p_pin: number;
          p_nome: string;
          p_cognome: string;
        };
        Returns: {
          id: string;
          pin: number;
          nome: string;
          cognome: string;
        };
      };
    };
    Enums: {
      // Nessun enum definito nel schema attuale
    };
  };
}

// Helper types per accesso facile
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T];
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Tipi specifici per le tabelle principali
export type Utente = Tables<'utenti'>['Row'];
export type UtenteInsert = Tables<'utenti'>['Insert'];
export type UtenteUpdate = Tables<'utenti'>['Update'];

export type Timbratura = Tables<'timbrature'>['Row'];
export type TimbratureInsert = Tables<'timbrature'>['Insert'];
export type TimbratureUpdate = Tables<'timbrature'>['Update'];

export type ExDipendente = Tables<'ex_dipendenti'>['Row'];
export type TurnoGiornaliero = Views<'v_turni_giornalieri'>['Row'];
