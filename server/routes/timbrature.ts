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
 * POST /api/timbrature/manual - Inserisce nuova timbratura manuale dal Modale
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.post('/manual', async (req, res) => {
  try {
    // Verifica che il client Supabase sia inizializzato
    if (!supabaseAdmin) {
      console.error('[SERVER] Supabase admin client non disponibile');
      return res.status(500).json({
        success: false,
        error: 'Configurazione server non completa - variabili ambiente mancanti',
      });
    }

    const { pin, tipo, giorno, ora } = req.body ?? {};

    console.info('[SERVER] INSERT manual timbratura →', { pin, tipo, giorno, ora });

    // Validazioni nette
    if (!pin || !tipo || !giorno || !ora) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: pin, tipo, giorno, ora',
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(giorno)) {
      return res.status(400).json({
        success: false,
        error: 'giorno deve essere YYYY-MM-DD',
      });
    }

    if (!/^\d{2}:\d{2}$/.test(ora)) {
      return res.status(400).json({
        success: false,
        error: 'ora deve essere HH:mm',
      });
    }

    const pinNum = Number(pin);
    if (!Number.isInteger(pinNum) || pinNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'PIN non valido',
      });
    }

    if (!['ENTRATA', 'USCITA', 'entrata', 'uscita'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo non valido (ENTRATA|USCITA)',
      });
    }

    const [H, M] = ora.split(':').map(Number);
    const date = new Date(`${giorno}T${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}:00.000Z`);
    
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Data/ora non valide',
      });
    }

    const tsIso = date.toISOString();
    const giorno_logico = giorno; // se hai cut-off (es. 05:00), applicalo qui
    const data_locale = giorno_logico;
    const ora_locale = `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}:00`;
    const tipoNormalized = tipo.toLowerCase();

    console.info('[SERVER] INSERT manual params validated →', { 
      pin: pinNum, 
      tipo: tipoNormalized, 
      giorno_logico, 
      data_locale, 
      ora_locale 
    });

    // INSERT con SERVICE_ROLE_KEY (bypassa RLS)
    const { data, error } = await supabaseAdmin
      .from('timbrature')
      .insert([{
        pin: pinNum,
        tipo: tipoNormalized,
        ts_order: tsIso,
        created_at: tsIso,
        giorno_logico,
        data_locale,
        ora_locale,
      }])
      .select('*')
      .single();

    if (error) {
      console.error('[SERVER] INSERT manual fallito →', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.info('[SERVER] INSERT manual success →', { 
      id: data.id, 
      pin: pinNum, 
      tipo: tipoNormalized, 
      giorno_logico 
    });

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVER] INSERT manual error →', { error: message });
    
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * POST /api/timbrature - Inserisce nuova timbratura
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.post('/', async (req, res) => {
  try {
    // Verifica che il client Supabase sia inizializzato
    if (!supabaseAdmin) {
      console.error('[SERVER] Supabase admin client non disponibile');
      return res.status(500).json({
        success: false,
        error: 'Configurazione server non completa - variabili ambiente mancanti',
      });
    }

    const { pin, tipo, ts } = req.body as { pin?: number; tipo?: 'entrata'|'uscita'; ts?: string };

    console.info('[SERVER] INSERT timbratura →', { pin, tipo, ts });

    // Validazione parametri
    if (!pin || !tipo) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: pin, tipo',
      });
    }

    if (!['entrata', 'uscita'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo non valido (entrata|uscita)',
      });
    }

    const pinNum = Number(pin);
    if (!Number.isInteger(pinNum) || pinNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'PIN non valido',
      });
    }

    // Timestamp server se non fornito
    const now = ts ? new Date(ts) : new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    
    // Giorno logico: logica cut-off 05:00 (come nel resto dell'app)
    let giornoLogico = `${yyyy}-${mm}-${dd}`;
    if (now.getHours() >= 0 && now.getHours() < 5) {
      // Orario notturno: appartiene al giorno precedente
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yyyyPrev = yesterday.getFullYear();
      const mmPrev = String(yesterday.getMonth() + 1).padStart(2, '0');
      const ddPrev = String(yesterday.getDate()).padStart(2, '0');
      giornoLogico = `${yyyyPrev}-${mmPrev}-${ddPrev}`;
    }
    
    const dataLocale = `${yyyy}-${mm}-${dd}`;
    const oraLocale = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    console.info('[SERVER] INSERT params validated →', { 
      pin: pinNum, 
      tipo, 
      giornoLogico, 
      dataLocale, 
      oraLocale 
    });

    // INSERT con SERVICE_ROLE_KEY (bypassa RLS)
    const { data, error } = await supabaseAdmin
      .from('timbrature')
      .insert([{
        pin: pinNum,
        tipo,
        ts_order: now.toISOString(),
        created_at: now.toISOString(),
        giorno_logico: giornoLogico,
        data_locale: dataLocale,
        ora_locale: oraLocale,
      }])
      .select('*')
      .single();

    if (error) {
      console.error('[SERVER] INSERT fallito →', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.info('[SERVER] INSERT success →', { 
      id: data.id, 
      pin: pinNum, 
      tipo, 
      giornoLogico 
    });

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVER] INSERT error →', { error: message });
    
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

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
