import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UtentiService } from '../utenti.service';

// Mock safeFetch
vi.mock('@/lib/safeFetch', () => ({
  safeFetchJson: vi.fn(),
  safeFetchJsonPost: vi.fn(),
  safeFetchJsonDelete: vi.fn(),
}));

import { safeFetchJson, safeFetchJsonPost, safeFetchJsonDelete } from '@/lib/safeFetch';

describe('UtentiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUtenti', () => {
    it('dovrebbe restituire lista utenti trasformata correttamente', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'uuid-1',
            pin: 1,
            nome: 'Mario',
            cognome: 'Rossi',
            ore_contrattuali: 8.0,
            email: 'mario@test.com',
            telefono: '123456789',
            created_at: '2025-01-01T10:00:00Z',
            note: null
          },
          {
            id: 'uuid-2',
            pin: 2,
            nome: 'Luigi',
            cognome: 'Verdi',
            ore_contrattuali: 6.0,
            email: null,
            telefono: null,
            created_at: '2025-01-02T11:00:00Z',
            note: 'Part-time'
          }
        ]
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse);

      const result = await UtentiService.getUtenti();

      expect(safeFetchJson).toHaveBeenCalledWith('/api/utenti');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'uuid-1',
        pin: 1,
        nome: 'Mario',
        cognome: 'Rossi',
        ore_contrattuali: 8.0,
        email: 'mario@test.com',
        telefono: '123456789'
      });
      expect(result[1]).toMatchObject({
        id: 'uuid-2',
        pin: 2,
        nome: 'Luigi',
        cognome: 'Verdi',
        ore_contrattuali: 6.0,
        email: '',
        telefono: ''
      });
    });

    it('dovrebbe gestire errore API correttamente', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Database connection failed'
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockErrorResponse);

      await expect(UtentiService.getUtenti()).rejects.toThrow('Database connection failed');
    });

    it('dovrebbe gestire dati vuoti', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse);

      const result = await UtentiService.getUtenti();

      expect(result).toEqual([]);
    });
  });

  describe('isPinAvailable', () => {
    it('dovrebbe restituire true per PIN disponibile', async () => {
      const mockResponse = {
        success: true,
        data: { exists: false }
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse);

      const result = await UtentiService.isPinAvailable(99);

      expect(safeFetchJson).toHaveBeenCalledWith('/api/utenti/pin/99');
      expect(result.available).toBe(true);
    });

    it('dovrebbe restituire false per PIN già in uso', async () => {
      const mockResponse = {
        success: true,
        data: { exists: true }
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse);

      const result = await UtentiService.isPinAvailable(1);

      expect(result.available).toBe(false);
    });

    it('dovrebbe gestire errori di connessione', async () => {
      const mockError = new Error('Network error');
      vi.mocked(safeFetchJson).mockRejectedValue(mockError);

      const result = await UtentiService.isPinAvailable(1);

      expect(result.available).toBe(true); // Fallback sicuro
      expect(result.error).toBe('Errore di connessione');
    });
  });

  describe('createUtente', () => {
    it('dovrebbe creare utente con successo', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'uuid-new',
          pin: 50,
          nome: 'Nuovo',
          cognome: 'Utente'
        }
      };

      const utenteData = {
        pin: 50,
        nome: 'Nuovo',
        cognome: 'Utente',
        email: 'nuovo@test.com',
        telefono: '987654321',
        ore_contrattuali: 8.0,
        descrizione_contratto: 'Full-time'
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockResponse);

      const result = await UtentiService.upsertUtente(utenteData);

      expect(safeFetchJsonPost).toHaveBeenCalledWith('/api/utenti', {
        pin: 50,
        nome: 'Nuovo',
        cognome: 'Utente',
        ore_contrattuali: 8.0
      });
      expect(result).toMatchObject({
        id: 'uuid-new',
        pin: 50,
        nome: 'Nuovo',
        cognome: 'Utente'
      });
    });

    it('dovrebbe gestire errore di validazione', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'PIN already exists',
        code: 'VALIDATION_ERROR'
      };

      const utenteData = {
        pin: 1,
        nome: 'Test',
        cognome: 'User',
        email: '',
        telefono: '',
        ore_contrattuali: 8.0,
        descrizione_contratto: ''
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockErrorResponse);

      await expect(UtentiService.createUtente(utenteData)).rejects.toThrow('PIN already exists');
    });
  });

  describe('deleteUtente', () => {
    it('dovrebbe eliminare utente con successo', async () => {
      const mockResponse = {
        success: true
      };

      vi.mocked(safeFetchJsonDelete).mockResolvedValue(mockResponse);

      await UtentiService.deleteUtente(99);

      expect(safeFetchJsonDelete).toHaveBeenCalledWith('/api/utenti/99');
      // deleteUtente non restituisce nulla, solo non lancia errori
    });

    it('dovrebbe gestire utente non trovato', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'User not found',
        code: 'NOT_FOUND'
      };

      vi.mocked(safeFetchJsonDelete).mockResolvedValue(mockErrorResponse);

      await expect(UtentiService.deleteUtente(999)).rejects.toThrow('User not found');
    });

    it('dovrebbe gestire PIN non valido', async () => {
      await expect(UtentiService.deleteUtente(0)).rejects.toThrow('PIN non valido');
      await expect(UtentiService.deleteUtente(100)).rejects.toThrow('PIN non valido');
    });
  });
});
