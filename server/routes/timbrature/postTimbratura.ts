// POST /api/timbrature - Inserisce nuova timbratura
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { computeGiornoLogico } from '../../shared/time/computeGiornoLogico';
import type { TimbratureInsert, Timbratura } from '../../../shared/types/database';
import { validateAlternanza } from './validation';

const router = Router();

// Tipi per eliminare any types
interface TimbratureRequestBody {
  pin?: number;
  tipo?: 'entrata' | 'uscita';
  ts?: string;
  anchorDate?: string;
}

/**
 * POST /api/timbrature - Inserisce nuova timbratura
 * Bypassa RLS usando SERVICE_ROLE_KEY
 */
router.post('/', async (req: Request, res: Response) => {
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

    const { pin, tipo, ts } = req.body as TimbratureRequestBody;

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
    
    const dataLocale = `${yyyy}-${mm}-${dd}`;
    const oraLocale = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    
    // Calcolo giorno logico unificato
    const { giorno_logico } = computeGiornoLogico({
      data: dataLocale,
      ora: oraLocale,
      tipo,
      dataEntrata: (req.body as TimbratureRequestBody).anchorDate // Parametro opzionale per ancoraggio
    });

    console.info('[SERVER] INSERT params validated →', { 
      pin: pinNum, 
      tipo, 
      giorno_logico, 
      dataLocale, 
      oraLocale 
    });

    // VALIDAZIONE ALTERNANZA CON ANCORAGGIO (STEP A)
    const validationResult = await validateAlternanza(
      pinNum,
      tipo,
      dataLocale,
      oraLocale,
      (req.body as TimbratureRequestBody).anchorDate
    );

    if (!validationResult.success) {
      console.warn('[SERVER] Validazione alternanza fallita:', {
        pin: pinNum,
        tipo,
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

    console.info('[SERVER] Validazione alternanza OK:', {
      pin: pinNum,
      tipo,
      giorno_logico,
      anchorEntry: validationResult.anchorEntry?.id || null
    });

    // INSERT con SERVICE_ROLE_KEY (bypassa RLS e trigger)
    const dto: TimbratureInsert = {
      pin: pinNum,
      tipo,
      ts_order: now.toISOString(),
      created_at: now.toISOString(),
      giorno_logico: giorno_logico,
      data_locale: dataLocale,
      ora_locale: oraLocale,
    };

    // TODO(ts): replace with exact Supabase types
    const insertResult = await supabaseAdmin!
      .from('timbrature')
      .insert([dto as any])
      .select('*')
      .single();
    
    const { data, error } = insertResult;

    if (error) {
      console.error('[SERVER] INSERT fallito →', { error: error.message });
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.info('[SERVER] INSERT success →', { 
      id: (data as Timbratura)?.id, 
      pin: pinNum, 
      tipo, 
      giorno_logico 
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

export default router;
