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
      
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .order('pin');

      if (error) {
        throw error;
      }

      return data || [];
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
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  // Crea/Aggiorna utente via RPC
  static async upsertUtente(pin: number, nome: string, cognome: string): Promise<void> {
    try {
      
      const { data, error } = await supabase.rpc('upsert_utente_rpc', { 
        p_pin: pin, 
        p_nome: nome || null, 
        p_cognome: cognome || null 
      });

      if (error) {
        throw error;
      }

    } catch (error) {
      throw error;
    }
  }

  // Crea nuovo utente (wrapper per compatibilità)
  static async createUtente(input: UtenteInput): Promise<Utente> {
    await this.upsertUtente(input.pin, input.nome, input.cognome);
    const utenti = await this.getUtenti();
    const nuovoUtente = utenti.find(u => u.pin === input.pin);
    if (!nuovoUtente) {
      throw new Error('Errore durante la creazione utente');
    }
    return nuovoUtente;
  }

  // Aggiorna utente esistente (usa upsert RPC)
  static async updateUtente(id: string, input: Partial<UtenteInput>): Promise<Utente> {
    if (input.pin && input.nome && input.cognome) {
      await this.upsertUtente(input.pin, input.nome, input.cognome);
    }
    const utenti = await this.getUtenti();
    const utenteAggiornato = utenti.find(u => u.id === id);
    if (!utenteAggiornato) {
      throw new Error('Utente non trovato dopo aggiornamento');
    }
    return utenteAggiornato;
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
        if (response.status === 503) {
          throw new Error('⚠️ Servizio eliminazione non disponibile. Contattare l\'amministratore per configurare le credenziali Supabase.');
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
      const { data, error } = await supabase
        .from('utenti')
        .select('pin')
        .eq('pin', pin)
        .single();
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
