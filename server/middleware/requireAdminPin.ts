// Middleware: protegge gli endpoint ADMIN richiedendo il PIN admin corretto.
//
// Modello di sicurezza (adatto a questa app):
//   - Le azioni admin (crea/modifica/elimina dipendenti, cambio PIN/impostazioni,
//     modifica/elimina timbrature) richiedono l'header 'x-admin-pin' con il PIN
//     admin corrente. Il middleware lo confronta col valore salvato in DB
//     (app_settings id='admin', letto via service-role che bypassa la RLS).
//   - Le azioni UTENTE (timbrare entrata/uscita) NON usano questo middleware:
//     restano libere, come da requisito (i dipendenti timbrano senza login).
//
// Note:
//   - Il PIN admin NON è più leggibile via chiave anon (migrazione RLS del 2026-07-14),
//     quindi non è banalmente recuperabile dall'esterno.
//   - Se il PIN admin non è configurato in DB, si usa il fallback '1909' (coerente
//     col resto del codice) per non bloccare l'app in stati non inizializzati.
//   - Confronto a tempo costante per non offrire un timing oracle sul PIN.

import type { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const DEFAULT_ADMIN_PIN = '1909';

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function requireAdminPin(req: Request, res: Response, next: NextFunction) {
  // Se Supabase non è configurato, lascia rispondere il 503 degli handler a valle
  // (comportamento coerente col resto del server) invece di bloccare qui.
  if (!supabaseAdmin) {
    return next();
  }

  const provided = req.header('x-admin-pin');
  if (!provided) {
    return res.status(401).json({
      success: false,
      error: 'Autenticazione admin richiesta',
      code: 'ADMIN_PIN_REQUIRED',
    });
  }

  try {
    const db = supabaseAdmin as unknown as SupabaseClient;
    const { data } = await db
      .from('app_settings')
      .select('access_pin')
      .eq('id', 'admin')
      .maybeSingle();

    const expected = (data?.access_pin as string | undefined) ?? DEFAULT_ADMIN_PIN;

    if (!safeEqual(provided, expected)) {
      return res.status(401).json({
        success: false,
        error: 'PIN admin non valido',
        code: 'ADMIN_PIN_INVALID',
      });
    }

    return next();
  } catch {
    // In caso di errore di lettura, nega per sicurezza (fail-closed).
    return res.status(401).json({
      success: false,
      error: 'Verifica admin non riuscita',
      code: 'ADMIN_PIN_CHECK_FAILED',
    });
  }
}
