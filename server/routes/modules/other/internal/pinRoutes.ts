// PIN validation routes
import { Router } from 'express';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { validatePinParam } from '../../../../utils/validation/pin';

const router = Router();

// GET /api/pin/validate — Risolvi PIN → user_id (service-role)
router.get('/api/pin/validate', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: 'Servizio non disponibile', code: 'SERVICE_UNAVAILABLE' });
    }
    const { pin } = req.query as { pin?: string };
    const validation = validatePinParam(pin);
    if (!validation.valid) {
      const code = validation.error === 'Parametro PIN obbligatorio' ? 'MISSING_PARAMS' : 'INVALID_PIN';
      return res.status(400).json({ success: false, error: validation.error, code });
    }
    const pinNum = validation.pinNum!;
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

export { router as pinRoutes };
