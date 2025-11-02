// Servizio per gestione utenti/dipendenti
// STEP B: Consolidamento server-only - usa solo /api endpoints

import { asError } from '@/lib/safeError';
import { normalizeError } from '@/lib/normalizeError';
import { safeFetchJson, safeFetchJsonPost, safeFetchJsonPut, safeFetchJsonDelete } from '@/lib/safeFetch';
import { isError, isSuccess } from '@/types/api';
import { validatePinInput } from '@/utils/validation/pin';
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
  archiviato_il: string;
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
        id: utente.pin?.toString() || '', // Usa PIN come identificativo (database non ha UUID)
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
      const pinError = validatePinInput(input.pin);
      if (pinError) {
        throw new Error(pinError);
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

  // Aggiorna utente esistente (usa PUT API)
  static async updateUtente(pin: number, input: Partial<UtenteInput>): Promise<Utente> {
    try {
      // Validazione PIN
      if (!pin || pin < 1 || pin > 99) {
        throw new Error('PIN non valido');
      }

      // Validazione campi se forniti
      if (input.nome !== undefined && !input.nome?.trim()) {
        throw new Error('Nome obbligatorio');
      }
      if (input.cognome !== undefined && !input.cognome?.trim()) {
        throw new Error('Cognome obbligatorio');
      }

      // Payload per API - invia tutti i campi modificabili
      const payload: Record<string, unknown> = {};
      if (input.nome !== undefined) payload.nome = input.nome.trim();
      if (input.cognome !== undefined) payload.cognome = input.cognome.trim();
      if (input.email !== undefined) payload.email = input.email?.trim() || null;
      if (input.telefono !== undefined) payload.telefono = input.telefono?.trim() || null;
      if (input.ore_contrattuali !== undefined) payload.ore_contrattuali = input.ore_contrattuali;
      if (input.descrizione_contratto !== undefined) payload.descrizione_contratto = input.descrizione_contratto?.trim() || null;

      const response = await safeFetchJsonPut<DbUtente>(`/api/utenti/${pin}`, payload);

      if (isError(response)) {
        throw new Error(normalizeError(response.error) || 'Errore durante l\'aggiornamento utente');
      }

      if (!response.data) {
        throw new Error('Nessun dato restituito dopo aggiornamento');
      }

      // Trasformo per compatibilità con l'interfaccia UI
      const utenteCompleto: Utente = {
        id: response.data.pin?.toString() || '',
        pin: response.data.pin,
        nome: response.data.nome,
        cognome: response.data.cognome,
        email: response.data.email || null,
        telefono: response.data.telefono || null,
        ore_contrattuali: response.data.ore_contrattuali || 8,
        note: response.data.note || null,
        descrizione_contratto: response.data.descrizione_contratto || null,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at || response.data.created_at,
      };

      return utenteCompleto;
    } catch (error) {
      throw asError(error);
    }
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

  // Archivia utente con motivo opzionale
  static async archiveUtente(userId: string, payload: { reason?: string }): Promise<{ success: boolean; error?: { code: string; message: string } }> {
    try {
      const response = await safeFetchJsonPost<{ success: boolean; message: string }>(`/api/utenti/${userId}/archive`, payload);

      if (isError(response)) {
        return {
          success: false,
          error: {
            code: response.code || 'ARCHIVE_FAILED',
            message: normalizeError(response.error) || 'Archiviazione non riuscita. Riprova.'
          }
        };
      }

      return { success: true };
    } catch (error) {
      const err = asError(error);
      console.error('[BadgeNode] Errore archiviazione utente:', err.message);
      return {
        success: false,
        error: {
          code: 'ARCHIVE_FAILED',
          message: 'Archiviazione non riuscita. Riprova.'
        }
      };
    }
  }

  static async restoreUtente(userId: string, payload: { newPin: string }): Promise<{ success: boolean; error?: { code: string; message: string } }> {
    try {
      const response = await safeFetchJsonPost<{ success: boolean }>(`/api/utenti/${userId}/restore`, payload);
      if (isError(response)) {
        return {
          success: false,
          error: {
            code: response.code || 'RESTORE_FAILED',
            message: normalizeError(response.error) || 'Ripristino non riuscito. Riprova.'
          }
        };
      }
      return { success: true };
    } catch (error) {
      const err = asError(error);
      console.error('[BadgeNode] Errore ripristino utente:', err.message);
      return {
        success: false,
        error: { code: 'RESTORE_FAILED', message: 'Ripristino non riuscito. Riprova.' }
      };
    }
  }

  static async deleteExDipendente(pin: number): Promise<{ success: boolean; error?: { code: string; message: string } }> {
    try {
      if (!pin || pin < 1 || pin > 99) {
        return { success: false, error: { code: 'INVALID_PIN', message: 'PIN non valido' } };
      }
      const response = await safeFetchJsonDelete(`/api/ex-dipendenti/${pin}`);
      if (isError(response)) {
        const code = response.code || 'DELETE_FAILED';
        const map: Record<string, string> = {
          USER_NOT_ARCHIVED: 'Utente non archiviato',
          FK_CONSTRAINT: 'Impossibile eliminare: vincoli attivi',
          DELETE_FAILED: 'Eliminazione non riuscita. Riprova.',
        };
        return { success: false, error: { code, message: map[code] || 'Eliminazione non riuscita. Riprova.' } };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: { code: 'DELETE_FAILED', message: 'Eliminazione non riuscita. Riprova.' } };
    }
  }
}
