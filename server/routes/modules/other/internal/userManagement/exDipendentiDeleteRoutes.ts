// Ex-dipendenti delete routes
import { Router } from 'express';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { sendError, sendSuccess, sendServiceUnavailable, sendInternalError } from '../helpers';

const router = Router();

// DELETE /api/ex-dipendenti/:pin - Eliminazione definitiva ex-dipendente
router.delete('/api/ex-dipendenti/:pin', async (req, res) => {
  const { pin } = req.params;
  const pinNum = parseInt(String(pin), 10);

  try {
    if (!supabaseAdmin) {
      return sendServiceUnavailable(res);
    }

    if (isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return res.status(400).json({ success: false, error: 'PIN non valido', code: 'INVALID_PIN' });
    }

    // Verifica che l'utente sia effettivamente archiviato
    const { data: archived, error: checkErr } = await supabaseAdmin
      .from('ex_dipendenti')
      .select('pin')
      .eq('pin', pinNum)
      .maybeSingle();
    if (checkErr || !archived) {
      return res.status(409).json({ success: false, error: 'Utente non archiviato', code: 'USER_NOT_ARCHIVED' });
    }

    // Hard delete dal registro ex_dipendenti (timbrature non toccate)
    const { error: delErr } = await supabaseAdmin
      .from('ex_dipendenti')
      .delete()
      .eq('pin', pinNum);

    if (delErr) {
      const code = (delErr as any)?.code || '';
      if (code === '23503') {
        return res.status(409).json({ success: false, error: 'Vincolo FK attivo', code: 'FK_CONSTRAINT' });
      }
      return res.status(500).json({ success: false, error: 'Eliminazione non riuscita', code: 'DELETE_FAILED' });
    }

    return sendSuccess(res);
  } catch (error) {
    return sendInternalError(res);
  }
});

export { router as exDipendentiDeleteRoutes };
