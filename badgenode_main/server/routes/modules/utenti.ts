import { Router } from 'express';
import { log } from '../../lib/logger';
import {
  invalidPinResponse,
  isPinTakenError,
  normalizeNullableString,
  normalizeOreContrattuali,
  normalizeRequiredString,
  serviceUnavailable,
  UTENTE_SELECT,
  utentiTable,
  type UtenteInsert,
  type UtenteRow,
  type UtenteUpdate,
} from './utenti.helpers';
const router = Router();
router.get('/api/utenti/:pin', async (req, res) => {
  try {
    const utenti = utentiTable();
    if (!utenti) {
      return serviceUnavailable(res);
    }
    const pinNum = Number.parseInt(req.params.pin, 10);
    if (Number.isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return invalidPinResponse(res);
    }
    const { data, error } = await utenti
      .select(UTENTE_SELECT)
      .eq('pin', pinNum)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: `Utente con PIN ${pinNum} non trovato`,
          code: 'NOT_FOUND',
        });
      }
      log.warn({ error: error.message, route: 'utenti:getByPin', pin: pinNum }, 'error fetching utente');
      return res.status(500).json({
        success: false,
        error: "Errore durante il recupero dell'utente",
        code: 'QUERY_ERROR',
      });
    }
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    log.error({ error, route: 'utenti:getByPin', pin: req.params.pin }, 'errore recupero utente');
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR',
    });
  }
});
router.get('/api/utenti', async (req, res) => {
  try {
    const traceId = req.header('x-badgenode-trace') || undefined;
    const utenti = utentiTable();
    if (!utenti) {
      return serviceUnavailable(res);
    }
    const { data, error } = await utenti
      .select(UTENTE_SELECT)
      .order('pin');
    if (error) {
      log.warn({ traceId, error: error.message, route: 'utenti:list' }, 'error fetching utenti');
      return res.status(500).json({
        success: false,
        error: 'Errore durante il recupero degli utenti',
        code: 'QUERY_ERROR',
      });
    }
    return res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    log.error({ traceId: req.header('x-badgenode-trace') || undefined, error, route: 'utenti:list' }, 'errore utenti');
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR',
    });
  }
});
router.get('/api/utenti/pin/:pin', async (req, res) => {
  try {
    const utenti = utentiTable();
    if (!utenti) {
      return serviceUnavailable(res);
    }
    const pinNum = Number.parseInt(req.params.pin, 10);
    if (Number.isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return invalidPinResponse(res);
    }
    const { data, error } = await utenti
      .select('pin, nome, cognome')
      .eq('pin', pinNum)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return res.json({
          success: true,
          exists: false,
          pin: pinNum,
        });
      }
      log.warn({ error: error.message, route: 'utenti:checkPin' }, 'error checking PIN');
      return res.status(500).json({
        success: false,
        error: 'Errore durante la verifica del PIN',
        code: 'QUERY_ERROR',
      });
    }
    return res.json({
      success: true,
      exists: true,
      data,
    });
  } catch (error) {
    log.error({ error, route: 'utenti:checkPin' }, 'errore verifica PIN');
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR',
    });
  }
});
router.post('/api/utenti', async (req, res) => {
  try {
    const utenti = utentiTable();
    if (!utenti) {
      return serviceUnavailable(res);
    }
    const {
      pin: rawPin,
      nome: rawNome,
      cognome: rawCognome,
      email: rawEmail,
      telefono: rawTelefono,
      ore_contrattuali: rawOreContrattuali,
      note: rawNote,
    } = req.body ?? {};
    const pin = typeof rawPin === 'number' ? rawPin : Number.parseInt(String(rawPin), 10);
    const nome = normalizeRequiredString(rawNome);
    const cognome = normalizeRequiredString(rawCognome);
    const email = normalizeNullableString(rawEmail);
    const telefono = normalizeNullableString(rawTelefono);
    const note = normalizeNullableString(rawNote);
    const oreContrattuali = normalizeOreContrattuali(rawOreContrattuali) ?? 8.0;
    if (!nome || !cognome) {
      return res.status(400).json({
        success: false,
        error: 'Nome e cognome sono obbligatori',
        code: 'BAD_REQUEST',
      });
    }
    if (Number.isNaN(pin) || pin < 1 || pin > 99) {
      return invalidPinResponse(res);
    }
    if (rawEmail !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email non valida',
        code: 'BAD_REQUEST',
      });
    }
    if (!Number.isFinite(oreContrattuali) || oreContrattuali < 0.25 || oreContrattuali > 24) {
      return res.status(400).json({
        success: false,
        error: 'Ore contrattuali devono essere tra 0.25 e 24',
        code: 'BAD_REQUEST',
      });
    }
    const insertPayload: UtenteInsert = {
      pin,
      nome,
      cognome,
      email,
      telefono,
      ore_contrattuali: oreContrattuali,
      note,
    };
    const { data, error } = await utenti
      .insert(insertPayload)
      .select(UTENTE_SELECT)
      .single();
    if (error) {
      log.error({ error: error.message, route: 'utenti:create', pin }, 'supabase INSERT error');
      if (isPinTakenError(error)) {
        return res.status(409).json({
          success: false,
          error: `PIN ${pin} già in uso`,
          code: 'PIN_TAKEN',
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Errore durante la creazione dell\'utente',
        code: 'QUERY_ERROR',
      });
    }
    log.info({ pin, nome, cognome, route: 'utenti:create' }, 'utente creato');
    return res.status(201).json({
      success: true,
      data: data as UtenteRow,
    });
  } catch (error) {
    log.error({ error, route: 'utenti:create' }, 'errore creazione utente');
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR',
    });
  }
});
router.put('/api/utenti/:pin', async (req, res) => {
  try {
    const utenti = utentiTable();
    if (!utenti) {
      return serviceUnavailable(res);
    }
    const pinNum = Number.parseInt(req.params.pin, 10);
    if (Number.isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return invalidPinResponse(res);
    }
    const { nome, cognome, email, telefono, ore_contrattuali, note } = req.body ?? {};
    const updatePayload: UtenteUpdate = {};
    if (nome !== undefined) {
      const nomeStr = normalizeRequiredString(nome);
      if (!nomeStr) {
        return res.status(400).json({
          success: false,
          error: 'Nome non può essere vuoto',
          code: 'BAD_REQUEST',
        });
      }
      updatePayload.nome = nomeStr;
    }
    if (cognome !== undefined) {
      const cognomeStr = normalizeRequiredString(cognome);
      if (!cognomeStr) {
        return res.status(400).json({
          success: false,
          error: 'Cognome non può essere vuoto',
          code: 'BAD_REQUEST',
        });
      }
      updatePayload.cognome = cognomeStr;
    }
    if (email !== undefined) {
      const normalizedEmail = normalizeNullableString(email);
      if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Email non valida',
          code: 'BAD_REQUEST',
        });
      }
      updatePayload.email = normalizedEmail;
    }
    if (telefono !== undefined) {
      updatePayload.telefono = normalizeNullableString(telefono);
    }
    if (ore_contrattuali !== undefined) {
      const oreNum = normalizeOreContrattuali(ore_contrattuali);
      if (oreNum === undefined || !Number.isFinite(oreNum) || oreNum < 0.25 || oreNum > 24) {
        return res.status(400).json({
          success: false,
          error: 'Ore contrattuali devono essere tra 0.25 e 24',
          code: 'BAD_REQUEST',
        });
      }
      updatePayload.ore_contrattuali = oreNum;
    }
    if (note !== undefined) {
      updatePayload.note = normalizeNullableString(note);
    }
    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nessun campo da aggiornare',
        code: 'BAD_REQUEST',
      });
    }
    const { data, error } = await utenti
      .update(updatePayload)
      .eq('pin', pinNum)
      .select(UTENTE_SELECT)
      .single();
    if (error) {
      log.error({ error: error.message, route: 'utenti:update', pin: pinNum }, 'supabase UPDATE error');
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: `Utente con PIN ${pinNum} non trovato`,
          code: 'NOT_FOUND',
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Errore durante l\'aggiornamento dell\'utente',
        code: 'QUERY_ERROR',
      });
    }
    log.info({ pin: pinNum, route: 'utenti:update' }, 'utente aggiornato');
    return res.json({
      success: true,
      data: data as UtenteRow,
    });
  } catch (error) {
    log.error({ error, route: 'utenti:update' }, 'errore aggiornamento utente');
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR',
    });
  }
});
export default router;
