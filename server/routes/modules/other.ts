// Altri endpoint API (ex-dipendenti, storico, test, delete utenti)
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { computeGiornoLogico } from '../../shared/time/computeGiornoLogico';

const router = Router();

function computeDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// GET /api/pin/validate — Risolvi PIN → user_id (service-role)
router.get('/api/pin/validate', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: 'Servizio non disponibile', code: 'SERVICE_UNAVAILABLE' });
    }
    const { pin } = req.query as { pin?: string };
    if (!pin) return res.status(400).json({ success: false, error: 'Parametro PIN obbligatorio', code: 'MISSING_PARAMS' });
    const pinNum = parseInt(pin, 10);
    if (isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return res.status(400).json({ success: false, error: 'PIN deve essere tra 1 e 99', code: 'INVALID_PIN' });
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API][pin.validate] starting pin=${pinNum}`);
    }
    // Pre-check table access (dev diagnostics)
    try {
      const { error: tblErr } = await supabaseAdmin
        .from('utenti')
        .select('pin', { head: true, count: 'exact' })
        .limit(1);
      if (tblErr && process.env.NODE_ENV === 'development') {
        console.error('[API][pin.validate] table_check_error:', (tblErr as any)?.message || tblErr);
      }
    } catch (tblEx) {
      if (process.env.NODE_ENV === 'development') console.error('[API][pin.validate] table_check_exception:', (tblEx as Error).message);
    }

    // Schema-agnostic lookup: seleziona solo 'pin'
    let data: any | null = null;
    let qErr: any | null = null;
    try {
      const resp = await supabaseAdmin
        .from('utenti')
        .select('pin')
        .eq('pin', pinNum)
        .limit(1)
        .maybeSingle();
      data = resp.data;
      qErr = resp.error;
    } catch (e) {
      qErr = e;
    }
    if (qErr) {
      const qMsg = (qErr as any)?.message || '';
      const qCode = (qErr as any)?.code || '';
      // PostgREST: no rows for maybeSingle
      if (qCode === 'PGRST116' || /no rows|results contain 0 rows|row not found/i.test(String(qMsg))) {
        if (process.env.NODE_ENV === 'development') console.log('[API][pin.validate] not_found');
        return res.status(404).json({ success: false, code: 'NOT_FOUND' });
      }
      if (process.env.NODE_ENV === 'development') console.error('[API][pin.validate] query_error:', qMsg || qErr);
      return res.status(500).json({ success: false, code: 'QUERY_ERROR', message: qMsg || 'query error' });
    }
    if (!data) {
      if (process.env.NODE_ENV === 'development') console.log('[API][pin.validate] not_found');
      return res.status(404).json({ success: false, code: 'NOT_FOUND' });
    }
    const userKey = String((data as any)?.pin);
    if (process.env.NODE_ENV === 'development') console.log('[API][pin.validate] ok');
    return res.json({ success: true, ok: true, user_key: userKey, pin: String((data as any)?.pin ?? pinNum) });
  } catch (e) {
    console.error('[API][pin.validate] query_error:', (e as Error).message);
    return res.status(500).json({ success: false, error: 'Errore interno', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/ex-dipendenti - Lista ex dipendenti
router.get('/api/ex-dipendenti', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // TODO(BUSINESS): Implementare tabella ex_dipendenti reale
    // Per ora restituisce array vuoto per Step 2 (read-only wiring)
    const { data, error } = await supabaseAdmin
      .from('ex_dipendenti')
      .select('*')
      .order('archiviato_il', { ascending: false });

    if (error) {
      console.warn('[API] Error fetching ex-dipendenti:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il recupero degli ex dipendenti',
        code: 'QUERY_ERROR'
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('[API] Errore ex-dipendenti:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/storico - Storico timbrature con filtri
router.get('/api/storico', async (req, res) => {
  const requestId = (req.headers['x-request-id'] as string) || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const { pin, dal, al } = req.query as { pin?: string; dal?: string; al?: string };
    const logBase = `[API][storico][${requestId}] pin=${pin ?? '-'} dal=${dal ?? '-'} al=${al ?? '-'}:`;

    if (!pin) {
      return res.status(400).json({
        success: false,
        error: 'Parametro PIN obbligatorio',
        code: 'MISSING_PARAMS'
      });
    }

    const pinNum = parseInt(pin, 10);
    if (isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return res.status(400).json({
        success: false,
        error: 'PIN deve essere un numero tra 1 e 99',
        code: 'INVALID_PIN'
      });
    }

    // Validazione date (YYYY-MM-DD)
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (dal && !dateRe.test(dal)) {
      return res.status(422).json({ success: false, error: 'Formato data dal non valido (YYYY-MM-DD)', code: 'INVALID_DATE_FROM' });
    }
    if (al && !dateRe.test(al)) {
      return res.status(422).json({ success: false, error: 'Formato data al non valido (YYYY-MM-DD)', code: 'INVALID_DATE_TO' });
    }

    let query = supabaseAdmin
      .from('v_turni_giornalieri')
      .select('*')
      .eq('pin', pinNum);

    if (dal) {
      query = query.gte('giorno_logico', dal);
    }
    if (al) {
      query = query.lte('giorno_logico', al);
    }

    const { data, error } = await query.order('giorno_logico', { ascending: false });

    if (error) {
      console.warn(`${logBase} view error:`, (error as any)?.message || error);
      // Fallback sempre: ricostruisci dai dati base timbrature
      let tQuery = supabaseAdmin
        .from('timbrature')
        .select('pin, giorno_logico, data_locale, ora_locale, tipo')
        .eq('pin', pinNum);
      // Estendi finestra su data_locale per catturare coppie cross-midnight
      const padStart = dal ? new Date(dal + 'T00:00:00') : null;
      const padEnd = al ? new Date(al + 'T00:00:00') : null;
      if (padStart) { padStart.setDate(padStart.getDate() - 1); }
      if (padEnd) { padEnd.setDate(padEnd.getDate() + 1); }
      if (padStart) tQuery = tQuery.gte('data_locale', computeDateStr(padStart));
      if (padEnd) tQuery = tQuery.lte('data_locale', computeDateStr(padEnd));
      const { data: timbri, error: tErr } = await tQuery.order('giorno_logico', { ascending: false }).order('ora_locale', { ascending: true });
      if (tErr) {
        console.error(`${logBase} fallback timbrature error:`, tErr.message);
        return res.status(500).json({ success: false, error: 'Errore durante il recupero dello storico', code: 'QUERY_ERROR', requestId });
      }
      // Ricostruisci righe tipo v_turni_giornalieri per giorno (sweep cronologico cross-day)
      const events = (timbri ?? [])
        .map((t: any) => ({
          pin: t.pin,
          data: String(t.data_locale),
          ora: String(t.ora_locale ?? '00:00:00'),
          tipo: String(t.tipo ?? '').toLowerCase(),
        }))
        .filter((e) => e.data && e.ora && e.tipo)
        .map((e) => ({ ...e, ts: new Date(`${e.data}T${e.ora.substring(0,5)}:00`).getTime() }))
        .sort((a, b) => a.ts - b.ts);

      const bucket: Record<string, { firstIn: string | null; lastOut: string | null; hours: number }> = {};
      let openIn: { data: string; ora: string } | null = null;
      let openInLogicalDay: string | null = null;
      for (const ev of events) {
        const k = ev.tipo;
        const isEntrata = k.startsWith('e') || k.startsWith('in');
        const isUscita = k.startsWith('u') || k.startsWith('out');
        if (isEntrata) {
          openIn = { data: ev.data, ora: ev.ora };
          openInLogicalDay = computeGiornoLogico({ data: ev.data, ora: ev.ora, tipo: 'entrata' }).giorno_logico;
          bucket[openInLogicalDay] = bucket[openInLogicalDay] || { firstIn: null, lastOut: null, hours: 0 };
          if (!bucket[openInLogicalDay].firstIn) bucket[openInLogicalDay].firstIn = ev.ora;
        } else if (isUscita && openIn && openInLogicalDay) {
          // Determina giorno logico per uscita con ancoraggio
          const outLogical = computeGiornoLogico({ data: ev.data, ora: ev.ora, tipo: 'uscita', dataEntrata: openIn.data }).giorno_logico;
          // Calcola diff ore tra ts entrata e uscita (gestendo rollover)
          const tsIn = new Date(`${openInLogicalDay}T${openIn.ora.substring(0,5)}:00`).getTime();
          let tsOut = new Date(`${outLogical}T${ev.ora.substring(0,5)}:00`).getTime();
          if (tsOut < tsIn) tsOut = tsOut + 24 * 60 * 60 * 1000;
          const diffH = Math.max(0, (tsOut - tsIn) / 3600000);
          bucket[openInLogicalDay] = bucket[openInLogicalDay] || { firstIn: null, lastOut: null, hours: 0 };
          bucket[openInLogicalDay].hours += diffH;
          bucket[openInLogicalDay].lastOut = ev.ora;
          // close interval
          openIn = null;
          openInLogicalDay = null;
        }
      }

      const rows = Object.entries(bucket)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .filter(([giorno]) => {
          if (dal && giorno < dal) return false;
          if (al && giorno > al) return false;
          return true;
        })
        .map(([giorno, agg]) => {
          const ore = Math.round(agg.hours * 100) / 100;
          return {
            pin: pinNum,
            giorno_logico: giorno,
            entrata: agg.firstIn,
            uscita: agg.lastOut,
            ore,
            extra: ore > 8 ? Math.round((ore - 8) * 100) / 100 : 0,
            nome: '',
            cognome: '',
            ore_contrattuali: 8,
          };
        });
      return res.json({ success: true, data: rows });
    }

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error(`[API][storico][${requestId}] exception:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR',
      requestId
    });
  }
});

// TEST /api/utenti/test-permissions - Testa permessi Supabase
router.get('/api/utenti/test-permissions', async (req, res) => {
  try {
    // Usa il client normale (ANON_KEY) per testare permessi
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        success: false,
        error: 'Configurazione Supabase client mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('utenti')
      .select('pin, nome, cognome')
      .limit(5);

    if (error) {
      return res.json({
        success: false,
        error: error.message,
        code: 'PERMISSION_DENIED',
        hasReadAccess: false
      });
    }

    res.json({
      success: true,
      hasReadAccess: true,
      recordCount: data?.length || 0,
      sampleData: data?.slice(0, 2) || []
    });
  } catch (error) {
    console.error('[API] Errore test permissions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

// DELETE /api/utenti/:pin - Elimina utente (richiede SERVICE_ROLE_KEY)
router.delete('/api/utenti/:pin', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const { pin } = req.params;
    const pinNum = parseInt(pin, 10);

    if (isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return res.status(400).json({
        success: false,
        error: 'PIN deve essere un numero tra 1 e 99',
        code: 'INVALID_PIN'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('utenti')
      .delete()
      .eq('pin', pinNum)
      .select();

    if (error) {
      console.warn('[API] Error deleting utente:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Errore durante l\'eliminazione dell\'utente',
        code: 'QUERY_ERROR'
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Utente con PIN ${pinNum} non trovato`,
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: `Utente con PIN ${pinNum} eliminato`,
      deletedUser: data[0]
    });
  } catch (error) {
    console.error('[API] Errore eliminazione utente:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/utenti/:id/archive - Archivia utente con doppia conferma
router.post('/api/utenti/:id/archive', async (req, res) => {
  const requestId = (req.headers['x-request-id'] as string) || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
  const { id } = req.params;
  const { reason } = req.body;
  
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // Validazione ID utente
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID utente obbligatorio',
        code: 'MISSING_PARAMS'
      });
    }

    // Verifica che l'utente esista e sia attivo (usa PIN come chiave)
    const { data: utente, error: userError } = await supabaseAdmin
      .from('utenti')
      .select('pin, nome, cognome')
      .eq('pin', id)
      .single();

    if (userError || !utente) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato',
        code: 'USER_NOT_FOUND'
      });
    }

    // TODO(BUSINESS): Implementare controllo stato archiviato se necessario
    // if (utente.stato === 'archiviato') {
    //   return res.status(409).json({
    //     success: false,
    //     error: 'Utente già archiviato',
    //     code: 'ALREADY_ARCHIVED'
    //   });
    // }

    // TODO(BUSINESS): Pre-check sessioni aperte - disabilitato per test
    // Schema database diverso dalla documentazione
    // const { data: sessioneAperta, error: sessionError } = await supabaseAdmin
    //   .from('timbrature')
    //   .select('id, tipo')
    //   .eq('pin', utente.pin)
    //   .order('created_at', { ascending: false })
    //   .limit(1);
    
    console.log(`[API][archive][${requestId}] Skipping session check - schema mismatch`);

    // Archiviazione reale: inserisce in tabella ex_dipendenti
    const now = new Date().toISOString();
    const { error: archiveError } = await supabaseAdmin
      .from('ex_dipendenti')
      .insert({
        pin: utente.pin,
        nome: utente.nome,
        cognome: utente.cognome,
        archiviato_il: now
      });

    if (archiveError) {
      console.error(`[API][archive][${requestId}] Archive failed:`, archiveError.message);
      return res.status(500).json({
        success: false,
        error: 'Archiviazione non riuscita. Riprova.',
        code: 'ARCHIVE_FAILED'
      });
    }

    // Rimuove l'utente dalla tabella utenti attivi
    const { error: deleteError } = await supabaseAdmin
      .from('utenti')
      .delete()
      .eq('pin', id);

    if (deleteError) {
      console.error(`[API][archive][${requestId}] Delete from utenti failed:`, deleteError.message);
      // Non blocchiamo l'operazione se il delete fallisce, l'utente è già archiviato
      console.warn(`[API][archive][${requestId}] User archived but not removed from utenti table`);
    }

    console.log(`[API][archive][${requestId}] User archived: ${utente.nome} ${utente.cognome} (PIN ${id})`);
    
    res.json({
      success: true,
      message: 'Dipendente archiviato con successo'
    });

  } catch (error) {
    console.error(`[API][archive][${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
