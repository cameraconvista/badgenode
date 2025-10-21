// DELETE /api/timbrature/day - Elimina tutte le timbrature di un giorno logico
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { Timbratura } from '../../../shared/types/database';

const router = Router();

/**
 * DELETE /api/timbrature/day - Elimina tutte le timbrature di un giorno logico
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.delete('/day', async (req: Request, res: Response) => {
  try {
    // Garantisci sempre Content-Type JSON
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Verifica che il client Supabase sia inizializzato
    if (!supabaseAdmin) {
      console.error('[SERVER] Supabase admin client non disponibile');
      return res.status(500).json({
        success: false,
        error: 'Configurazione server non completa - variabili ambiente mancanti',
      });
    }

    const { pin, giorno } = req.query as { pin?: string; giorno?: string };

    console.info('[SERVER] DELETE timbrature day →', { pin, giorno });

    // Validazione parametri
    if (!pin || !giorno) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: pin, giorno',
      });
    }

    // Validazione formato data yyyy-mm-dd
    if (!/^\d{4}-\d{2}-\d{2}$/.test(giorno)) {
      return res.status(400).json({
        success: false,
        error: 'Formato giorno non valido (yyyy-mm-dd)',
      });
    }

    const pinNum = Number(pin);
    if (!Number.isInteger(pinNum) || pinNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'PIN non valido',
      });
    }

    console.info('[SERVER] DELETE params validated →', { pin: pinNum, giorno });

    // Delete per PIN + giorno_logico con SERVICE_ROLE_KEY (bypassa RLS)
    const { data, error } = await supabaseAdmin
      .from('timbrature')
      .delete()
      .match({ pin: pinNum, giorno_logico: giorno })
      .select('id, tipo, ora_locale'); // per conoscere cosa è stato rimosso

    if (error) {
      console.error('[SERVER] DELETE fallito →', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    const deletedCount = data?.length || 0;
    const deletedIds = data?.map((r: Timbratura) => r.id) || [];

    console.info('[SERVER] DELETE success →', { 
      pin: pinNum, 
      giorno, 
      deletedCount,
      deletedIds 
    });

    res.json({
      success: true,
      deleted_count: deletedCount,
      ids: deletedIds,
      deleted_records: data,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVER] DELETE error →', { error: message });
    
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

export default router;
