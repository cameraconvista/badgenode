// Tipi database condivisi per BadgeNode
// Allineati allo schema reale `public` verificato via audit Supabase read-only del 2026-04-15.
// Nota di prudenza:
// - questo file descrive solo il perimetro DB reale confermato
// - alcuni campi opzionali legacy/compat restano esposti dove il runtime li usa gia` come fallback locale
// - nessuna view reale e` presente oggi in `public`

export interface Database {
  public: {
    Tables: {
      utenti: {
        Row: {
          pin: number;
          nome: string;
          cognome: string;
          created_at: string;
          email: string | null;
          telefono: string | null;
          ore_contrattuali: number;
          note: string | null;
          // Compat locale: non presenti nel DB reale, ma usati come fallback lato app/UI.
          descrizione_contratto?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          pin: number;
          nome: string;
          cognome: string;
          created_at?: string;
          email?: string | null;
          telefono?: string | null;
          ore_contrattuali?: number;
          note?: string | null;
          // Compat locale
          descrizione_contratto?: string | null;
          updated_at?: string | null;
        };
        Update: {
          pin?: number;
          nome?: string;
          cognome?: string;
          created_at?: string;
          email?: string | null;
          telefono?: string | null;
          ore_contrattuali?: number;
          note?: string | null;
          // Compat locale
          descrizione_contratto?: string | null;
          updated_at?: string | null;
        };
      };
      timbrature: {
        Row: {
          id: number;
          pin: number;
          tipo: 'entrata' | 'uscita';
          ts_order: string;
          created_at: string;
          giorno_logico: string | null;
          data_locale: string | null;
          ora_locale: string | null;
          client_event_id: string | null;
          giornologico: string | null;
        };
        Insert: {
          id?: number;
          pin: number;
          tipo: 'entrata' | 'uscita';
          ts_order: string;
          created_at?: string;
          giorno_logico?: string | null;
          data_locale?: string | null;
          ora_locale?: string | null;
          client_event_id?: string | null;
          giornologico?: string | null;
        };
        Update: {
          id?: number;
          pin?: number;
          tipo?: 'entrata' | 'uscita';
          ts_order?: string;
          created_at?: string;
          giorno_logico?: string | null;
          data_locale?: string | null;
          ora_locale?: string | null;
          client_event_id?: string | null;
          giornologico?: string | null;
        };
      };
      ex_dipendenti: {
        Row: {
          pin: number;
          nome: string | null;
          cognome: string | null;
          archiviato_il: string;
        };
        Insert: {
          pin: number;
          nome?: string | null;
          cognome?: string | null;
          archiviato_il?: string;
        };
        Update: {
          pin?: number;
          nome?: string | null;
          cognome?: string | null;
          archiviato_il?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      insert_timbro_v2: {
        Args: {
          p_pin: number;
          p_tipo: 'entrata' | 'uscita';
          p_client_event_id?: string | null;
        };
        Returns: Database['public']['Tables']['timbrature']['Row'];
      };
      enforce_alternanza_fn: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      enforce_alternanza_simple_fn: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      generate_timbrature_report: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      timbro_tipo: 'entrata' | 'uscita';
    };
  };
}

// Helper types per accesso facile.
// `Views` resta intenzionalmente vuoto finche` il perimetro DB reale `public` non espone view.
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

// Tipi locali per operazioni server (contratto insert reale, senza `id`)
export type TimbratureInsertClean = Omit<TimbratureInsert, 'id'>;
export type TimbratureUpdateClean = Partial<Omit<Timbratura, 'id' | 'created_at'>>;

export type ExDipendente = Tables<'ex_dipendenti'>['Row'];

// Tipo applicativo legacy per report storico:
// mantenuto fuori da `Database.Views` perche` nel DB reale `public` non esistono view.
export type TurnoGiornaliero = {
  pin: number;
  giorno_logico: string;
  entrata: string | null;
  uscita: string | null;
  ore: number | null;
  extra: number | null;
  nome: string;
  cognome: string;
  ore_contrattuali: number;
};
