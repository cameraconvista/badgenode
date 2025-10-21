// Servizio per gestione utenti/dipendenti
// STEP B: Consolidamento server-only - usa solo /api endpoints

import { asError } from '@/lib/safeError';
import { normalizeError } from '@/lib/normalizeError';
import { safeFetchJson, safeFetchJsonPost, safeFetchJsonDelete } from '@/lib/safeFetch';
import { isError, isSuccess } from '@/types/api';
import type { Utente as DbUtente } from '../../../shared/types/database';

export interface Utente {
  id: string;
  pin: number;
  nome: string;
  cognome: string;
  ore_contrattuali: number;
  email: string | null;
  telefono: string | null;
  created_at: string;
  note: string | null;
  // campi opzionali reali
  descrizione_contratto?: string | null;
  updated_at?: string;
}

export interface ExDipendente extends Utente {
  archiviato_at: string;
  motivo_archiviazione?: string;
}

export interface UtenteInput {
  nome: string;
  cognome: string;
  email?: string | null;
  telefono?: string | null;
  pin: number;
  ore_contrattuali: number;
  descrizione_contratto?: string | null;
}

export class UtentiService {
  // Ottieni lista utenti attivi
  static async getUtenti(): Promise<Utente[]> {
    try {
      const response = await safeFetchJson<DbUtente[]>('/api/utenti');

      if (isError(response)) {
        throw new Error(normalizeError(response.error) || 'Errore durante il recupero degli utenti');
      }

      // Trasformo i dati per compatibilità con l'interfaccia Utente
      const utentiCompleti: Utente[] = (response.data || []).map((utente: DbUtente) => ({
        ...utente,
        id: utente.id || utente.pin?.toString() || '', // Usa ID esistente o PIN come fallback
        email: utente.email || '', // Mantieni email se presente
        telefono: utente.telefono || '', // Mantieni telefono se presente
        descrizione_contratto: utente.descrizione_contratto ?? null, // Campo opzionale
        updated_at: utente.updated_at ?? utente.created_at, // Usa updated_at se presente
      }));

      return utentiCompleti;
    } catch (error) {
      console.error('Errore durante il recupero degli utenti:', error);
      throw asError(error);
    }
  }

  // Ottieni lista ex-dipendenti
  static async getExDipendenti(): Promise<ExDipendente[]> {
    try {
      const response = await safeFetchJson<ExDipendente[]>('/api/ex-dipendenti');

      if (isError(response)) {
        throw new Error(normalizeError(response.error) || 'Errore durante il recupero degli ex dipendenti');
      }

      if (isSuccess(response)) {
        return response.data;
      }

      return [];
    } catch (error) {
      throw asError(error);
    }
  }

  // Ottieni utente per PIN (sostituisce getUtenteById)
  static async getUtenteByPin(pin: number): Promise<Utente | null> {
    try {
      const utenti = await this.getUtenti();
      return utenti.find(u => u.pin === pin) || null;
    } catch (_error) {
      return null;
    }
  }

  // Crea/Aggiorna utente via API server-only
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

      // Payload per API
      const payload = {
        pin: input.pin,
        nome: input.nome.trim(),
        cognome: input.cognome.trim(),
        ore_contrattuali: input.ore_contrattuali || 8.0,
      };

      const response = await safeFetchJsonPost<DbUtente>('/api/utenti', payload);

      if (isError(response)) {
        throw new Error(normalizeError(response.error) || 'Errore durante la creazione utente');
      }

      if (!response.data) {
        throw new Error('Nessun dato restituito dopo creazione');
      }

      // Trasformo per compatibilità con l'interfaccia UI
      const utenteCompleto: Utente = {
        id: response.data.pin?.toString() || '',
        pin: response.data.pin,
        nome: response.data.nome,
        cognome: response.data.cognome,
        email: input.email || null,
        telefono: input.telefono || null,
        ore_contrattuali: input.ore_contrattuali || 8,
        note: null,
        descrizione_contratto: input.descrizione_contratto || null,
        created_at: response.data.created_at,
        updated_at: response.data.created_at,
      };

      return utenteCompleto;
    } catch (error) {
      throw asError(error);
    }
  }

  // Crea nuovo utente (wrapper per compatibilità)
  static async createUtente(input: UtenteInput): Promise<Utente> {
    return await this.upsertUtente(input);
  }

  // Aggiorna utente esistente (usa upsert API)
  static async updateUtente(pin: number, input: Partial<UtenteInput>): Promise<Utente> {
    // Ottieni i dati attuali dell'utente
    const utenteCorrente = await this.getUtenteByPin(pin);
    if (!utenteCorrente) {
      throw new Error('Utente non trovato');
    }

    // Merge dei dati attuali con quelli nuovi
    const inputCompleto: UtenteInput = {
      pin: input.pin ?? utenteCorrente.pin,
      nome: input.nome ?? utenteCorrente.nome,
      cognome: input.cognome ?? utenteCorrente.cognome,
      email: input.email ?? utenteCorrente.email ?? null,
      telefono: input.telefono ?? utenteCorrente.telefono ?? null,
      ore_contrattuali: input.ore_contrattuali ?? utenteCorrente.ore_contrattuali,
      descrizione_contratto: input.descrizione_contratto ?? utenteCorrente.descrizione_contratto ?? null,
    };

    return await this.upsertUtente(inputCompleto);
  }

  static async deleteUtente(pin: number): Promise<void> {
    try {
      // Validazione PIN
      if (!pin || pin < 1 || pin > 99) {
        throw new Error('PIN non valido');
      }

      const response = await safeFetchJsonDelete<void>(`/api/utenti/${pin}`);

      if (isError(response)) {
        throw new Error(normalizeError(response.error) || 'Errore durante eliminazione utente');
      }
    } catch (error) {
      throw asError(error);
    }
  }

  static async isPinAvailable(pin: number): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await safeFetchJson<{ exists: boolean }>(`/api/utenti/pin/${pin}`);
      
      if (isError(response)) {
        return { available: true, error: 'Impossibile verificare PIN' };
      }
      
      const pinEsistente = response.data?.exists || false;
      return { available: !pinEsistente };
    } catch (e) {
      const err = asError(e);
      console.error('[BadgeNode] Errore verifica PIN:', err.message);
      return { available: true, error: 'Errore di connessione' };
    }
  }
}
