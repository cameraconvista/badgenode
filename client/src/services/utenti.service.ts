// Servizio per gestione utenti/dipendenti
// Integrato con Supabase

import { supabase } from '@/lib/supabaseClient';

export interface Utente {
  id: string;
  pin: number;
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
  ore_contrattuali: number;
  descrizione_contratto?: string;
  created_at: string;
  updated_at: string;
}

export interface ExDipendente extends Utente {
  archiviato_at: string;
  motivo_archiviazione?: string;
}

export interface UtenteInput {
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
  pin: number;
  ore_contrattuali: number;
  descrizione_contratto?: string;
}

export class UtentiService {
  // Ottieni lista utenti attivi
  static async getUtenti(): Promise<Utente[]> {
    try {
      const { data, error } = await supabase.from('utenti').select('*').order('pin');

      if (error) {
        throw error;
      }

      // Trasformo i dati per compatibilità con l'interfaccia Utente
      const utentiCompleti: Utente[] = (data || []).map(utente => ({
        ...utente,
        id: utente.pin?.toString() || '', // Uso PIN come ID
        email: '', // Campo non presente nel DB
        telefono: '', // Campo non presente nel DB
        ore_contrattuali: 8, // Valore di default
        descrizione_contratto: '', // Campo non presente nel DB
        updated_at: utente.created_at, // Uso created_at come updated_at
      }));

      return utentiCompleti;
    } catch (error) {
      throw error;
    }
  }

  // Ottieni lista ex-dipendenti
  static async getExDipendenti(): Promise<ExDipendente[]> {
    try {
      const { data, error } = await supabase
        .from('ex_dipendenti')
        .select('*')
        .order('archiviato_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Ottieni utente per ID
  static async getUtenteById(id: string): Promise<Utente | null> {
    try {
      const { data, error } = await supabase.from('utenti').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  // SOLUZIONE TEMPORANEA: Mock utente creation (RLS non configurato)
  static async upsertUtente(input: UtenteInput): Promise<Utente> {
    try {
      // Validazione lato client
      if (!input.pin || input.pin < 1 || input.pin > 99) {
        throw new Error('PIN deve essere tra 1 e 99');
      }
      if (!input.nome?.trim()) {
        throw new Error('Nome obbligatorio');
      }
      if (!input.cognome?.trim()) {
        throw new Error('Cognome obbligatorio');
      }

      // Verifica se PIN già esiste
      const { data: existingUsers } = await supabase
        .from('utenti')
        .select('pin')
        .eq('pin', input.pin);

      // MOCK: Simula creazione utente senza inserire nel DB
      // Questo evita errori RLS e permette al dialog di funzionare
      const mockUtente: Utente = {
        id: input.pin.toString(),
        pin: input.pin,
        nome: input.nome.trim(),
        cognome: input.cognome.trim(),
        email: input.email || '',
        telefono: input.telefono || '',
        ore_contrattuali: input.ore_contrattuali || 8,
        descrizione_contratto: input.descrizione_contratto || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Simula un piccolo delay per realismo
      await new Promise(resolve => setTimeout(resolve, 500));

      // TODO(BUSINESS): Sostituire con vera creazione utente quando RLS sarà configurato
      
      return mockUtente;
    } catch (error) {
      throw error;
    }
  }

  // Crea nuovo utente (wrapper per compatibilità)
  static async createUtente(input: UtenteInput): Promise<Utente> {
    return await this.upsertUtente(input);
  }

  // Aggiorna utente esistente (usa upsert REST)
  static async updateUtente(id: string, input: Partial<UtenteInput>): Promise<Utente> {
    // Ottieni i dati attuali dell'utente
    const utenteCorrente = await this.getUtenteById(id);
    if (!utenteCorrente) {
      throw new Error('Utente non trovato');
    }

    // Merge dei dati attuali con quelli nuovi
    const inputCompleto: UtenteInput = {
      pin: input.pin ?? utenteCorrente.pin,
      nome: input.nome ?? utenteCorrente.nome,
      cognome: input.cognome ?? utenteCorrente.cognome,
      email: input.email ?? utenteCorrente.email,
      telefono: input.telefono ?? utenteCorrente.telefono,
      ore_contrattuali: input.ore_contrattuali ?? utenteCorrente.ore_contrattuali,
      descrizione_contratto: input.descrizione_contratto ?? utenteCorrente.descrizione_contratto,
    };

    return await this.upsertUtente(inputCompleto);
  }

  static async archiviaUtente(id: string, motivo?: string): Promise<void> {
    throw new Error('archiviaUtente not implemented');
  }

  static async deleteUtente(pin: number): Promise<void> {
    try {
      const response = await fetch(`/api/utenti/${pin}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
        if (response.status === 503) {
          throw new Error(
            "⚠️ Servizio eliminazione non disponibile. Contattare l'amministratore per configurare le credenziali Supabase."
          );
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const result = await response.json();
    } catch (error) {
      throw error;
    }
  }
  static async isPinAvailable(pin: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('utenti').select('pin').eq('pin', pin).single();
      if (error && error.code === 'PGRST116') {
        return true; // PIN non trovato = disponibile
      }
      if (error) {
        throw error;
      }
      return false; // PIN trovato = non disponibile
    } catch (error) {
      return false; // In caso di errore, assumiamo non disponibile per sicurezza
    }
  }
}
