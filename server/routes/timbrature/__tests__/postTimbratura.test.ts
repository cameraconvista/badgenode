import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import postTimbratura from '../postTimbratura';

// Mock supabaseAdmin
vi.mock('../../../lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    rpc: vi.fn()
  }
}));

import { supabaseAdmin } from '../../../lib/supabaseAdmin';

describe('POST /api/timbrature - postTimbratura', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/timbrature', postTimbratura);
  });

  describe('Inserimento Timbrature', () => {
    it('dovrebbe inserire entrata con successo', async () => {
      const mockRpcResponse = {
        data: {
          id: 123,
          pin: 1,
          tipo: 'entrata',
          giorno_logico: '2025-10-21',
          data_locale: '2025-10-21',
          ora_locale: '08:00:00'
        },
        error: null
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcResponse);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'entrata'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 123,
        pin: 1,
        tipo: 'entrata'
      });
      expect(supabaseAdmin.rpc).toHaveBeenCalledWith('insert_timbro_v2', {
        p_pin: 1,
        p_tipo: 'entrata'
      });
    });

    it('dovrebbe inserire uscita con successo', async () => {
      const mockRpcResponse = {
        data: {
          id: 124,
          pin: 1,
          tipo: 'uscita',
          giorno_logico: '2025-10-21',
          data_locale: '2025-10-21',
          ora_locale: '17:00:00'
        },
        error: null
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcResponse);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'uscita'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tipo).toBe('uscita');
    });

    it('dovrebbe gestire PIN non valido', async () => {
      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 0, // PIN non valido
          tipo: 'entrata'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('PIN deve essere tra 1 e 99');
    });

    it('dovrebbe gestire tipo timbratura non valido', async () => {
      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'pausa' // Tipo non valido
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Tipo deve essere entrata o uscita');
    });

    it('dovrebbe gestire parametri mancanti', async () => {
      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1
          // Manca tipo
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('PIN e tipo sono obbligatori');
    });
  });

  describe('Validazione Alternanza', () => {
    it('dovrebbe gestire violazione alternanza entrata', async () => {
      const mockRpcError = {
        data: null,
        error: {
          message: 'Alternanza violata: ultima timbratura è già entrata',
          code: 'ALTERNANZA_ERROR'
        }
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcError);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'entrata'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Alternanza violata');
      expect(response.body.code).toBe('ALTERNANZA_ERROR');
    });

    it('dovrebbe gestire violazione alternanza uscita', async () => {
      const mockRpcError = {
        data: null,
        error: {
          message: 'Alternanza violata: ultima timbratura è già uscita',
          code: 'ALTERNANZA_ERROR'
        }
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcError);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'uscita'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Alternanza violata');
    });
  });

  describe('Gestione Errori Database', () => {
    it('dovrebbe gestire errore database generico', async () => {
      const mockRpcError = {
        data: null,
        error: {
          message: 'Database connection failed',
          code: 'DATABASE_ERROR'
        }
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcError);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'entrata'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Database connection failed');
    });

    it('dovrebbe gestire PIN inesistente', async () => {
      const mockRpcError = {
        data: null,
        error: {
          message: 'PIN 999 non trovato',
          code: 'PIN_NOT_FOUND'
        }
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcError);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 999,
          tipo: 'entrata'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('PIN 999 non trovato');
    });

    it('dovrebbe gestire eccezione runtime', async () => {
      vi.mocked(supabaseAdmin.rpc).mockRejectedValue(new Error('Network timeout'));

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'entrata'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Errore interno del server');
    });
  });

  describe('Giorno Logico e Turni Notturni', () => {
    it('dovrebbe gestire entrata notturna (cutoff 05:00)', async () => {
      const mockRpcResponse = {
        data: {
          id: 125,
          pin: 1,
          tipo: 'entrata',
          giorno_logico: '2025-10-20', // Giorno precedente per entrata notturna
          data_locale: '2025-10-21',
          ora_locale: '02:30:00'
        },
        error: null
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcResponse);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'entrata'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.giorno_logico).toBe('2025-10-20');
      expect(response.body.data.data_locale).toBe('2025-10-21');
    });

    it('dovrebbe gestire uscita cross-midnight', async () => {
      const mockRpcResponse = {
        data: {
          id: 126,
          pin: 1,
          tipo: 'uscita',
          giorno_logico: '2025-10-20', // Stesso giorno logico dell\'entrata
          data_locale: '2025-10-21',
          ora_locale: '06:00:00'
        },
        error: null
      };

      vi.mocked(supabaseAdmin.rpc).mockResolvedValue(mockRpcResponse);

      const response = await request(app)
        .post('/api/timbrature')
        .send({
          pin: 1,
          tipo: 'uscita'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.giorno_logico).toBe('2025-10-20');
    });
  });
});
