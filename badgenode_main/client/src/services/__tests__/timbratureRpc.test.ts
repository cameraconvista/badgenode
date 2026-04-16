import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  callInsertTimbro, 
  callUpdateTimbro, 
  deleteTimbratureGiornata,
  type InsertTimbroParams,
  type UpdateTimbroParams 
} from '../timbratureRpc';

// Mock safeFetch
vi.mock('@/lib/safeFetch', () => ({
  safeFetchJsonPost: vi.fn(),
  safeFetchJsonPatch: vi.fn(),
  safeFetchJsonDelete: vi.fn(),
}));

import { safeFetchJsonPost, safeFetchJsonPatch, safeFetchJsonDelete } from '@/lib/safeFetch';

describe('TimbratureRpc Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callInsertTimbro', () => {
    it('dovrebbe inserire timbratura entrata con successo', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 123,
          pin: 1,
          tipo: 'entrata',
          giorno_logico: '2025-10-21',
          data_locale: '2025-10-21',
          ora_locale: '08:00:00'
        }
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockResponse);

      const params: InsertTimbroParams = {
        pin: 1,
        tipo: 'entrata',
        client_event_id: 'test-123'
      };

      const result = await callInsertTimbro(params);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 123,
        pin: 1,
        tipo: 'entrata'
      });
    });

    it('dovrebbe inserire timbratura uscita con successo', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 124,
          pin: 1,
          tipo: 'uscita',
          giorno_logico: '2025-10-21',
          data_locale: '2025-10-21',
          ora_locale: '17:00:00'
        }
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockResponse);

      const params: InsertTimbroParams = {
        pin: 1,
        tipo: 'uscita'
      };

      const result = await callInsertTimbro(params);

      expect(result.success).toBe(true);
      expect(result.data?.tipo).toBe('uscita');
    });

    it('dovrebbe gestire errore di validazione PIN', async () => {
      const mockError = new Error('PIN non valido');
      vi.mocked(safeFetchJsonPost).mockRejectedValue(mockError);

      const params: InsertTimbroParams = {
        pin: 999,
        tipo: 'entrata'
      };

      await expect(callInsertTimbro(params)).rejects.toThrow('PIN non valido');
    });

    it('dovrebbe gestire alternanza entrata/uscita', async () => {
      // Mock per errore alternanza
      const mockErrorResponse = {
        success: false,
        error: 'Alternanza violata: ultima timbratura è già entrata',
        code: 'ALTERNANZA_ERROR'
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockErrorResponse);

      const params: InsertTimbroParams = {
        pin: 1,
        tipo: 'entrata'
      };

      const result = await callInsertTimbro(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Alternanza violata');
    });
  });

  describe('callUpdateTimbro', () => {
    it('dovrebbe aggiornare timbratura con successo', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 123,
          pin: 1,
          tipo: 'entrata',
          data_locale: '2025-10-21',
          ora_locale: '08:30:00'
        }
      };

      vi.mocked(safeFetchJsonPatch).mockResolvedValue(mockResponse);

      const params: UpdateTimbroParams = {
        id: 123,
        updateData: {
          data_locale: '2025-10-21',
          ora_locale: '08:30:00'
        }
      };

      const result = await callUpdateTimbro(params);

      expect(safeFetchJsonPatch).toHaveBeenCalledWith('/api/timbrature/123', {
        data_locale: '2025-10-21',
        ora_locale: '08:30:00'
      });
      expect(result.success).toBe(true);
    });

    it('dovrebbe gestire timbratura non trovata', async () => {
      const mockError = new Error('Timbratura non trovata');
      vi.mocked(safeFetchJsonPatch).mockRejectedValue(mockError);

      const params: UpdateTimbroParams = {
        id: 999,
        updateData: {
          ora_locale: '09:00:00'
        }
      };

      await expect(callUpdateTimbro(params)).rejects.toThrow('Timbratura non trovata');
    });
  });

  describe('deleteTimbratureGiornata', () => {
    it('dovrebbe eliminare timbrature giornata con successo', async () => {
      const mockResponse = {
        success: true,
        deleted_count: 2,
        deleted_ids: [123, 124]
      };

      vi.mocked(safeFetchJsonDelete).mockResolvedValue(mockResponse);

      const result = await deleteTimbratureGiornata({
        pin: 1,
        giorno: '2025-10-21'
      });

      expect(safeFetchJsonDelete).toHaveBeenCalledWith('/api/timbrature/day', {
        pin: '1', // PIN convertito a string
        giorno: '2025-10-21'
      });
      expect(result.deleted_count).toBe(2);
      expect(result.deleted_ids).toEqual([123, 124]);
    });

    it('dovrebbe gestire giornata senza timbrature', async () => {
      const mockResponse = {
        success: true,
        deleted_count: 0,
        deleted_ids: []
      };

      vi.mocked(safeFetchJsonDelete).mockResolvedValue(mockResponse);

      const result = await deleteTimbratureGiornata({
        pin: 1,
        giorno: '2025-10-22'
      });

      expect(result.deleted_count).toBe(0);
      expect(result.deleted_ids).toEqual([]);
    });

    it('dovrebbe gestire PIN non valido', async () => {
      const mockError = new Error('PIN non valido');
      vi.mocked(safeFetchJsonDelete).mockRejectedValue(mockError);

      await expect(deleteTimbratureGiornata({
        pin: 0,
        giorno: '2025-10-21'
      })).rejects.toThrow('PIN non valido');
    });
  });

  describe('Edge Cases e Validazioni', () => {
    it('dovrebbe gestire parametri mancanti', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Parametri obbligatori mancanti',
        code: 'VALIDATION_ERROR'
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockErrorResponse);

      const params: InsertTimbroParams = {
        pin: 0, // PIN non valido
        tipo: 'entrata'
      };

      const result = await callInsertTimbro(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Parametri obbligatori mancanti');
    });

    it('dovrebbe gestire tipo timbratura non valido', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Tipo timbratura non valido',
        code: 'VALIDATION_ERROR'
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockErrorResponse);

      const params: InsertTimbroParams = {
        pin: 1,
        tipo: 'entrata' // Uso tipo valido per il test
      };

      const result = await callInsertTimbro(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tipo timbratura non valido');
    });
  });
});
