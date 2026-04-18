import type { Utente as DbUtente } from '../../../shared/types/database';
import type { Utente, UtenteInput } from './utenti.service';

export function mapDbUtenteToUi(utente: DbUtente): Utente {
  return {
    ...utente,
    id: utente.pin?.toString() || '',
    email: utente.email || '',
    telefono: utente.telefono || '',
    descrizione_contratto: utente.descrizione_contratto ?? null,
    updated_at: utente.updated_at ?? utente.created_at,
  };
}

export function buildUtentePayload(input: UtenteInput): Record<string, unknown> {
  return {
    pin: input.pin,
    nome: input.nome.trim(),
    cognome: input.cognome.trim(),
    ore_contrattuali: input.ore_contrattuali || 8.0,
    email: input.email?.trim() || null,
    telefono: input.telefono?.trim() || null,
  };
}

export function buildUtenteUpdatePayload(input: Partial<UtenteInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.nome !== undefined) payload.nome = input.nome.trim();
  if (input.cognome !== undefined) payload.cognome = input.cognome.trim();
  if (input.email !== undefined) payload.email = input.email?.trim() || null;
  if (input.telefono !== undefined) payload.telefono = input.telefono?.trim() || null;
  if (input.ore_contrattuali !== undefined) payload.ore_contrattuali = input.ore_contrattuali;
  return payload;
}

export function mapCreatedUtente(responseData: DbUtente, input: UtenteInput): Utente {
  return {
    id: responseData.pin?.toString() || '',
    pin: responseData.pin,
    nome: responseData.nome,
    cognome: responseData.cognome,
    email: responseData.email || null,
    telefono: responseData.telefono || null,
    ore_contrattuali: responseData.ore_contrattuali || input.ore_contrattuali || 8,
    note: responseData.note || null,
    descrizione_contratto: input.descrizione_contratto || null,
    created_at: responseData.created_at,
    updated_at: responseData.updated_at || responseData.created_at,
  };
}

export function mapUpdatedUtente(responseData: DbUtente): Utente {
  return {
    id: responseData.pin?.toString() || '',
    pin: responseData.pin,
    nome: responseData.nome,
    cognome: responseData.cognome,
    email: responseData.email || null,
    telefono: responseData.telefono || null,
    ore_contrattuali: responseData.ore_contrattuali || 8,
    note: responseData.note || null,
    descrizione_contratto: responseData.descrizione_contratto || null,
    created_at: responseData.created_at,
    updated_at: responseData.updated_at || responseData.created_at,
  };
}

export function mapDeleteExError(code: string): string {
  const map: Record<string, string> = {
    USER_NOT_ARCHIVED: 'Utente non archiviato',
    FK_CONSTRAINT: 'Impossibile eliminare: vincoli attivi',
    DELETE_FAILED: 'Eliminazione non riuscita. Riprova.',
  };
  return map[code] || 'Eliminazione non riuscita. Riprova.';
}
