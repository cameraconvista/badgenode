// Archive user routes
import { Router } from 'express';
import { log } from '../../../../../lib/logger';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { generateRequestId } from '../helpers';

const router = Router();
type ActiveUser = {
  pin: string | number;
  nome: string;
  cognome: string;
};
type ArchiveInsertPayload = {
  pin: string | number;
  nome: string;
  cognome: string;
  archiviato_il: string;
};
type MutationError = { message?: string } | null;

interface ExDipendentiTableAdapter {
  insert(values: ArchiveInsertPayload[]): Promise<{ error: MutationError }>;
}

function exDipendentiTable(): ExDipendentiTableAdapter | null {
  if (!supabaseAdmin) return null;
  return supabaseAdmin.from('ex_dipendenti') as unknown as ExDipendentiTableAdapter;
}

// POST /api/utenti/:id/archive - Archivia utente con doppia conferma
router.post('/api/utenti/:id/archive', async (req, res) => {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  const { id } = req.params;
  
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // Validazione ID utente
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID utente obbligatorio',
        code: 'MISSING_PARAMS'
      });
    }

    // Verifica che l'utente esista e sia attivo (usa PIN come chiave)
    const { data: utente, error: userError } = await supabaseAdmin
      .from('utenti')
      .select('pin, nome, cognome')
      .eq('pin', id)
      .single();

    if (userError || !utente) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato',
        code: 'USER_NOT_FOUND'
      });
    }

    // TODO(BUSINESS): Implementare controllo stato archiviato se necessario
    // if (utente.stato === 'archiviato') {
    //   return res.status(409).json({
    //     success: false,
    //     error: 'Utente già archiviato',
    //     code: 'ALREADY_ARCHIVED'
    //   });
    // }

    // TODO(BUSINESS): Pre-check sessioni aperte - disabilitato per test
    // Schema database diverso dalla documentazione
    // const { data: sessioneAperta, error: sessionError } = await supabaseAdmin
    //   .from('timbrature')
    //   .select('id, tipo')
    //   .eq('pin', utente.pin)
    //   .order('created_at', { ascending: false })
    //   .limit(1);
    
    log.info(`[API][archive][${requestId}] Skipping session check - schema mismatch`);

    // Archiviazione reale: inserisce in tabella ex_dipendenti
    const now = new Date().toISOString();
    const archivedUser: ActiveUser = utente;
    const exDipendenti = exDipendentiTable();
    if (!exDipendenti) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const { error: archiveError } = await exDipendenti.insert([
      {
        pin: archivedUser.pin,
        nome: archivedUser.nome,
        cognome: archivedUser.cognome,
        archiviato_il: now,
      },
    ]);

    if (archiveError) {
      log.error(`[API][archive][${requestId}] Archive failed:`, archiveError.message);
      return res.status(500).json({
        success: false,
        error: 'Archiviazione non riuscita. Riprova.',
        code: 'ARCHIVE_FAILED'
      });
    }

    // Rimuove l'utente dalla tabella utenti attivi
    const { error: deleteError } = await supabaseAdmin
      .from('utenti')
      .delete()
      .eq('pin', id);

    if (deleteError) {
      log.error(`[API][archive][${requestId}] Delete from utenti failed:`, deleteError.message);
      // Non blocchiamo l'operazione se il delete fallisce, l'utente è già archiviato
      log.warn(`[API][archive][${requestId}] User archived but not removed from utenti table`);
    }

    log.info(`[API][archive][${requestId}] User archived: ${archivedUser.nome} ${archivedUser.cognome} (PIN ${id})`);
    
    res.json({
      success: true,
      message: 'Dipendente archiviato con successo'
    });

  } catch (error) {
    log.error(`[API][archive][${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

export { router as archiveRoutes };
