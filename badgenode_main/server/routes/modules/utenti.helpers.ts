import type { Response } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { Database } from '../../../shared/types/database';

export type UtenteRow = Database['public']['Tables']['utenti']['Row'];
export type UtenteInsert = Database['public']['Tables']['utenti']['Insert'];
export type UtenteUpdate = Database['public']['Tables']['utenti']['Update'];
export type UtentePinLookup = Pick<UtenteRow, 'pin' | 'nome' | 'cognome'>;
type QueryError = { code?: string; message?: string } | null;

interface OrderQuery<T> {
  order(column: 'pin'): Promise<{ data: T[] | null; error: QueryError }>;
}

interface SingleQuery<T> {
  single(): Promise<{ data: T | null; error: QueryError }>;
}

interface SelectableMutation<T> {
  select(columns: string): SingleQuery<T>;
}

interface EqSingleQuery<T> {
  eq(column: 'pin', value: number): SingleQuery<T>;
}

interface UpdatableMutation<T> {
  eq(column: 'pin', value: number): SelectableMutation<T>;
}

export interface UtentiTableAdapter {
  select(columns: string): OrderQuery<UtenteRow> & EqSingleQuery<UtentePinLookup>;
  insert(values: UtenteInsert): SelectableMutation<UtenteRow>;
  update(values: UtenteUpdate): UpdatableMutation<UtenteRow>;
}

export const UTENTE_SELECT = 'pin, nome, cognome, email, telefono, ore_contrattuali, note, created_at';

export function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeOreContrattuali(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function invalidPinResponse(res: Response) {
  return res.status(400).json({
    success: false,
    error: 'PIN deve essere un numero tra 1 e 99',
    code: 'INVALID_PIN',
  });
}

export function serviceUnavailable(res: Response) {
  return res.status(503).json({
    success: false,
    error: 'Servizio admin non disponibile - configurazione Supabase mancante',
    code: 'SERVICE_UNAVAILABLE',
  });
}

export function isPinTakenError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '23505' ||
    error.code === '409' ||
    /duplicate|already exists|unique/i.test(error.message || '')
  );
}

export function utentiTable(): UtentiTableAdapter | null {
  if (!supabaseAdmin) return null;
  return supabaseAdmin.from('utenti') as unknown as UtentiTableAdapter;
}
