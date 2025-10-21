// PATCH /api/timbrature/:id - Aggiorna timbratura esistente
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { TimbratureUpdateClean } from '../../../shared/types/database';

const router = Router();

/**
 * PATCH /api/timbrature/:id - Aggiorna timbratura esistente
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.patch('/:id', async (req: Request, res: Response) => {
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

    const { id } = req.params;
    const updateData = req.body;

    console.info('[SERVER] UPDATE timbratura →', { id, updateData });

    // Verifica che ci siano campi da aggiornare
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nessun campo da aggiornare fornito',
      });
    }

    // Verifica che il record esista
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('timbrature')
      .select('id, tipo, pin, data_locale, ora_locale')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      console.error('[SERVER] Record non trovato →', { id, error: checkError?.message });
      return res.status(404).json({
        success: false,
        error: `Record id=${id} non trovato`,
      });
    }

    console.info('[SERVER] Record esistente →', existing);

    // Esegui UPDATE con SERVICE_ROLE_KEY (bypassa RLS)
    const patch: TimbratureUpdateClean = updateData as TimbratureUpdateClean;
    // TODO(ts): replace with exact Supabase types
    const updateResult = await supabaseAdmin!
      .from('timbrature')
      .update(patch as unknown as TimbratureUpdateClean)
      .eq('id', id)
      .select();
    
    const { data, error } = updateResult;

    if (error) {
      console.error('[SERVER] UPDATE fallito →', { id, error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      console.error('[SERVER] UPDATE nessuna riga →', { id });
      return res.status(500).json({
        success: false,
        error: 'Nessuna riga aggiornata',
      });
    }

    console.info('[SERVER] UPDATE success →', { id, rows: data.length });
    
    res.json({
      success: true,
      data: data[0],
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVER] UPDATE error →', { error: message });
    
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

export default router;
