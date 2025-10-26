// Restore user routes
import { Router } from 'express';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { generateRequestId } from '../helpers';

const router = Router();

// POST /api/utenti/:id/restore - Ripristina ex-dipendente assegnando un nuovo PIN
router.post('/api/utenti/:id/restore', async (req, res) => {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  const { id } = req.params; // id = PIN ex-dipendente archiviato
  const { newPin } = req.body as { newPin?: string | number };

  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID utente obbligatorio', code: 'MISSING_PARAMS' });
    }

    const oldPinNum = parseInt(String(id), 10);
    if (isNaN(oldPinNum) || oldPinNum < 1 || oldPinNum > 99) {
      return res.status(400).json({ success: false, error: 'PIN non valido', code: 'INVALID_PIN' });
    }

    const newPinNum = parseInt(String(newPin ?? ''), 10);
    if (isNaN(newPinNum) || newPinNum < 1 || newPinNum > 99) {
      return res.status(400).json({ success: false, error: 'Nuovo PIN non valido (1-99)', code: 'INVALID_NEW_PIN' });
    }

    // Verifica che l'utente sia davvero archiviato
    const { data: exUser, error: exErr } = await supabaseAdmin
      .from('ex_dipendenti')
      .select('pin, nome, cognome')
      .eq('pin', oldPinNum)
      .maybeSingle();

    if (exErr || !exUser) {
      return res.status(409).json({ success: false, error: 'Utente non archiviato', code: 'USER_NOT_ARCHIVED' });
    }

    // Verifica disponibilità nuovo PIN
    const { data: pinCheck, error: pinErr } = await supabaseAdmin
      .from('utenti')
      .select('pin', { head: false, count: 'exact' })
      .eq('pin', newPinNum)
      .limit(1);
    if (pinErr) {
      console.warn(`[API][restore][${requestId}] PIN check error:`, pinErr.message);
    }
    if ((pinCheck && pinCheck.length > 0)) {
      return res.status(409).json({ success: false, error: 'PIN già in uso', code: 'PIN_IN_USE' });
    }

    // Inserisce nuovamente in utenti con il nuovo PIN
    const now = new Date().toISOString();
    const { error: insErr } = await supabaseAdmin
      .from('utenti')
      .insert([
        { pin: newPinNum, nome: (exUser as any).nome, cognome: (exUser as any).cognome, created_at: now } as any,
      ] as any);
    if (insErr) {
      console.error(`[API][restore][${requestId}] Insert utenti failed:`, insErr.message);
      return res.status(500).json({ success: false, error: 'Ripristino non riuscito', code: 'RESTORE_FAILED' });
    }

    // Rimuove dalla tabella ex_dipendenti il record originale
    const { error: delErr } = await supabaseAdmin
      .from('ex_dipendenti')
      .delete()
      .eq('pin', oldPinNum);
    if (delErr) {
      console.warn(`[API][restore][${requestId}] Delete ex_dipendenti failed:`, delErr.message);
      // Non annulliamo il restore se il delete fallisce: il record è già stato ripristinato tra gli attivi
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(`[API][restore][${requestId}] Error:`, (error as Error)?.message || error);
    return res.status(500).json({ success: false, error: 'Errore interno', code: 'INTERNAL_ERROR' });
  }
});

export { router as restoreRoutes };
