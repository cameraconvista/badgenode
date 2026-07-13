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

export { router as settingsRoutes };
