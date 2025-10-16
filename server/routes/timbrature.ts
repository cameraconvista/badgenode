// Endpoint dedicato per UPDATE timbrature
// Usa SERVICE_ROLE_KEY per bypassare RLS

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Client Supabase con SERVICE_ROLE_KEY (bypassa RLS)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[TIMBRATURE] Env check →', {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceRoleKey: !!serviceRoleKey,
  supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
});

let supabaseAdmin: any = null;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Mancano variabili ambiente per endpoint timbrature');
  console.error('   SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
} else {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ [TIMBRATURE] Supabase admin client inizializzato');
}

/**
 * DELETE /api/timbrature/day - Elimina tutte le timbrature di un giorno logico
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.delete('/day', async (req, res) => {
  try {
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
    const deletedIds = data?.map((r: any) => r.id) || [];

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

/**
 * PATCH /api/timbrature/:id - Aggiorna timbratura esistente
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.patch('/:id', async (req, res) => {
  try {
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
    const { data, error } = await supabaseAdmin
      .from('timbrature')
      .update(updateData)
      .eq('id', id)
      .select();

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
