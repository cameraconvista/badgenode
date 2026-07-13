// Settings routes — configurazione PIN di accesso alle impostazioni (app_settings)
import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { generateRequestId } from '../internal/helpers';

const router = Router();

// Scope validi = id delle righe app_settings.
//  'admin'   -> PIN per accedere all'area amministrazione
//  'general' -> PIN per accedere all'app in generale (schermata all'avvio)
const VALID_SCOPES = ['admin', 'general'] as const;
type Scope = (typeof VALID_SCOPES)[number];

function isValidScope(s: string): s is Scope {
  return (VALID_SCOPES as readonly string[]).includes(s);
}

// Client non tipizzato per la tabella app_settings: il tipo Database del client
// admin fa inferire 'never' su query/upsert di questa tabella (limite noto del
// generic Supabase con PK text + default). Il cast qui è localizzato e sicuro:
// la validazione dei dati resta esplicita nel codice sottostante.
function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function unavailable(res: import('express').Response) {
  return res.status(503).json({
    success: false,
    error: 'Servizio admin non disponibile - configurazione Supabase mancante',
    code: 'SERVICE_UNAVAILABLE',
  });
}

// GET /api/settings/pin/:scope — legge la config PIN dello scope (admin|general).
// Il gate user (Home, non autenticato) valida il PIN lato client, quindi il PIN è
// leggibile: è una protezione UI a bassa criticità, by-design come da migrazione.
router.get('/api/settings/pin/:scope', async (req, res) => {
  const requestId = generateRequestId();
  try {
    if (!supabaseAdmin) return unavailable(res);

    const { scope } = req.params;
    if (!isValidScope(scope)) {
      return res.status(400).json({ success: false, error: 'Scope non valido', code: 'INVALID_SCOPE' });
    }

    const { data, error } = await db()
      .from('app_settings')
      .select('require_pin, access_pin')
      .eq('id', scope)
      .maybeSingle();

    if (error) {
      console.error(`[API][settings][${requestId}] select error:`, error.message);
      return res.status(500).json({ success: false, error: 'Errore lettura impostazioni', code: 'QUERY_ERROR', requestId });
    }

    // Fallback ai default se la riga manca (robustezza: la migrazione la crea).
    return res.json({
      success: true,
      data: {
        requirePin: data?.require_pin ?? false,
        pin: data?.access_pin ?? '1909',
      },
    });
  } catch (e) {
    console.error(`[API][settings][${requestId}] exception:`, e);
    return res.status(500).json({ success: false, error: 'Errore interno', code: 'INTERNAL_ERROR', requestId });
  }
});

// PUT /api/settings/pin/:scope — aggiorna toggle e/o PIN dello scope (admin|general).
// Body: { requirePin?: boolean, pin?: string, currentPin?: string }
//   - se si cambia il PIN (pin presente), currentPin deve combaciare con quello salvato.
router.put('/api/settings/pin/:scope', async (req, res) => {
  const requestId = generateRequestId();
  try {
    if (!supabaseAdmin) return unavailable(res);

    const { scope } = req.params;
    if (!isValidScope(scope)) {
      return res.status(400).json({ success: false, error: 'Scope non valido', code: 'INVALID_SCOPE' });
    }

    const { requirePin, pin, currentPin } = (req.body ?? {}) as {
      requirePin?: boolean;
      pin?: string;
      currentPin?: string;
    };

    // Stato attuale (serve per verificare currentPin quando si cambia il PIN).
    const { data: current, error: readErr } = await db()
      .from('app_settings')
      .select('require_pin, access_pin')
      .eq('id', scope)
      .maybeSingle();
    if (readErr) {
      console.error(`[API][settings][${requestId}] read error:`, readErr.message);
      return res.status(500).json({ success: false, error: 'Errore lettura impostazioni', code: 'QUERY_ERROR', requestId });
    }

    const update: { require_pin?: boolean; access_pin?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    // Toggle richiesta PIN.
    if (typeof requirePin === 'boolean') {
      update.require_pin = requirePin;
    }

    // Cambio PIN: valida formato + verifica PIN attuale.
    if (pin !== undefined) {
      if (!/^\d{4}$/.test(pin)) {
        return res.status(422).json({ success: false, error: 'Il PIN deve essere di 4 cifre', code: 'INVALID_PIN' });
      }
      const savedPin = current?.access_pin ?? '1909';
      if (currentPin !== savedPin) {
        return res.status(403).json({ success: false, error: 'PIN attuale non corretto', code: 'WRONG_CURRENT_PIN' });
      }
      update.access_pin = pin;
    }

    // Niente da aggiornare oltre updated_at.
    if (update.require_pin === undefined && update.access_pin === undefined) {
      return res.status(400).json({ success: false, error: 'Nessuna modifica richiesta', code: 'NO_CHANGES' });
    }

    // Upsert sulla riga dello scope: resiste anche se la riga mancasse.
    const { error: upErr } = await db()
      .from('app_settings')
      .upsert({ id: scope, ...update }, { onConflict: 'id' });
    if (upErr) {
      console.error(`[API][settings][${requestId}] update error:`, upErr.message);
      return res.status(500).json({ success: false, error: 'Errore salvataggio impostazioni', code: 'UPDATE_ERROR', requestId });
    }

    return res.json({ success: true, data: { ok: true } });
  } catch (e) {
    console.error(`[API][settings][${requestId}] exception:`, e);
    return res.status(500).json({ success: false, error: 'Errore interno', code: 'INTERNAL_ERROR', requestId });
  }
});

// ===== Config avviso timbrature anomale (riga 'alert', colonna config JSON) =====

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const ALERT_TIME_KEYS = ['e1_start', 'e1_end', 'e2_start', 'e2_end', 'u_evening_from', 'u_night_until'] as const;
const ALERT_DEFAULTS = {
  enabled: true,
  e1_start: '16:45', e1_end: '17:15',
  e2_start: '19:15', e2_end: '19:45',
  u_evening_from: '22:45', u_night_until: '03:45',
};

// GET /api/settings/alert — config fasce avviso (per Storico + form admin).
router.get('/api/settings/alert', async (_req, res) => {
  const requestId = generateRequestId();
  try {
    if (!supabaseAdmin) return unavailable(res);
    const { data, error } = await db()
      .from('app_settings')
      .select('config')
      .eq('id', 'alert')
      .maybeSingle();
    if (error) {
      console.error(`[API][settings][${requestId}] alert select error:`, error.message);
      return res.status(500).json({ success: false, error: 'Errore lettura avviso', code: 'QUERY_ERROR', requestId });
    }
    return res.json({ success: true, data: { ...ALERT_DEFAULTS, ...(data?.config ?? {}) } });
  } catch (e) {
    console.error(`[API][settings][${requestId}] alert exception:`, e);
    return res.status(500).json({ success: false, error: 'Errore interno', code: 'INTERNAL_ERROR', requestId });
  }
});

// PUT /api/settings/alert — aggiorna config fasce avviso. Scrittura service-role.
router.put('/api/settings/alert', async (req, res) => {
  const requestId = generateRequestId();
  try {
    if (!supabaseAdmin) return unavailable(res);
    const body = (req.body ?? {}) as Record<string, unknown>;

    // Valida ogni orario presente (HH:MM). enabled dev'essere boolean se presente.
    for (const k of ALERT_TIME_KEYS) {
      if (body[k] !== undefined && (typeof body[k] !== 'string' || !HHMM.test(body[k] as string))) {
        return res.status(422).json({ success: false, error: `Orario "${k}" non valido (usa HH:MM)`, code: 'INVALID_TIME' });
      }
    }
    if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
      return res.status(422).json({ success: false, error: 'Campo enabled non valido', code: 'INVALID_ENABLED' });
    }

    // Merge coi valori attuali (parte dai default) per non perdere chiavi non inviate.
    const { data: current } = await db().from('app_settings').select('config').eq('id', 'alert').maybeSingle();
    const merged = { ...ALERT_DEFAULTS, ...(current?.config ?? {}), ...body };

    const { error: upErr } = await db()
      .from('app_settings')
      .upsert({ id: 'alert', require_pin: false, access_pin: '0000', config: merged }, { onConflict: 'id' });
    if (upErr) {
      console.error(`[API][settings][${requestId}] alert update error:`, upErr.message);
      return res.status(500).json({ success: false, error: 'Errore salvataggio avviso', code: 'UPDATE_ERROR', requestId });
    }
    return res.json({ success: true, data: { ok: true } });
  } catch (e) {
    console.error(`[API][settings][${requestId}] alert exception:`, e);
    return res.status(500).json({ success: false, error: 'Errore interno', code: 'INTERNAL_ERROR', requestId });
  }
});

export { router as settingsRoutes };
