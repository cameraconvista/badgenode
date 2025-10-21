// POST /api/timbrature/manual - Inserisce nuova timbratura manuale dal Modale
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { computeGiornoLogico } from '../../shared/time/computeGiornoLogico';
import type { TimbratureInsertClean, Timbratura } from '../../../shared/types/database';
import { validateAlternanza } from './validation';

const router = Router();

/**
 * POST /api/timbrature/manual - Inserisce nuova timbratura manuale dal Modale
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.post('/manual', async (req: Request, res: Response) => {
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
    const tipoNormalized = tipo.toLowerCase();
    
    // Calcolo giorno logico unificato
    const { giorno_logico } = computeGiornoLogico({
      data: giorno,
      ora: `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}:00`,
      tipo: tipoNormalized as 'entrata' | 'uscita',
      dataEntrata: req.body.anchorDate // Parametro opzionale per ancoraggio
    });
    
    const data_locale = giorno;
    const ora_locale = `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}:00`;

    console.info('[SERVER] INSERT manual params validated →', { 
      pin: pinNum, 
      tipo: tipoNormalized, 
      giorno_logico, 
      data_locale, 
      ora_locale 
    });

    // VALIDAZIONE ALTERNANZA CON ANCORAGGIO (STEP A)
    const validationResult = await validateAlternanza(
      pinNum,
      tipoNormalized as 'entrata' | 'uscita',
      giorno,
      ora_locale,
      req.body.anchorDate
    );

    if (!validationResult.success) {
      console.warn('[SERVER] Validazione alternanza fallita (manual):', {
        pin: pinNum,
        tipo: tipoNormalized,
        giorno_logico,
        code: validationResult.code,
        error: validationResult.error
      });
      
      return res.status(400).json({
        success: false,
        error: validationResult.error,
        code: validationResult.code
      });
    }

    console.info('[SERVER] Validazione alternanza OK (manual):', {
      pin: pinNum,
      tipo: tipoNormalized,
      giorno_logico,
      anchorEntry: validationResult.anchorEntry?.id || null
    });

    // INSERT con SERVICE_ROLE_KEY (bypassa RLS e trigger)
    const dto: TimbratureInsertClean = {
      pin: pinNum,
      tipo: tipoNormalized,
      ts_order: tsIso,
      created_at: tsIso,
      giorno_logico,
      data_locale,
      ora_locale,
    };

    // TODO(ts): replace with exact Supabase types
    const insertResult = await supabaseAdmin!
      .from('timbrature')
      .insert([dto as any])
      .select('*')
      .single();
    
    const { data, error } = insertResult;

    if (error) {
      console.error('[SERVER] INSERT manual fallito →', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.info('[SERVER] INSERT manual success →', { 
      id: (data as Timbratura)?.id, 
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

export default router;
