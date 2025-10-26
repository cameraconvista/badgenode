// Delete user routes
import { Router } from 'express';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

const router = Router();

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
        error: 'PIN deve essere tra 1 e 99',
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

export { router as deleteRoutes };
