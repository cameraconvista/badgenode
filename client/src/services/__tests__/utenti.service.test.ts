import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UtentiService } from '../utenti.service';

// Mock safeFetch
vi.mock('../../lib/safeFetch', () => ({
  safeFetchJson: vi.fn(),
  safeFetchJsonPost: vi.fn(),
  safeFetchJsonDelete: vi.fn(),
}));

import { safeFetchJson, safeFetchJsonPost, safeFetchJsonDelete } from '../../lib/safeFetch';

describe('UtentiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUtenti', () => {
    it('dovrebbe restituire lista utenti trasformata correttamente', async () => {
      const mockResponse = {
        success: true as const,
        data: [
          {
            id: 'uuid-1',
            pin: 1,
            nome: 'Mario',
            cognome: 'Rossi',
            ore_contrattuali: 8,
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
            ore_contrattuali: 6,
            email: null,
            telefono: null,
            created_at: '2025-01-02T11:00:00Z',
            note: 'Part-time'
          }
        ]
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse as any);

      const result = await UtentiService.getUtenti();

      expect(safeFetchJson).toHaveBeenCalledWith('/api/utenti', undefined);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        pin: 1,
        nome: 'Mario',
        cognome: 'Rossi',
        ore_contrattuali: 8,
        email: 'mario@test.com',
        telefono: '123456789'
      });
      expect(result[1]).toMatchObject({
        id: '2',
        pin: 2,
        nome: 'Luigi',
        cognome: 'Verdi',
        ore_contrattuali: 6,
        email: '',
        telefono: ''
      });
    });

    it('dovrebbe gestire errore API correttamente', async () => {
      const mockErrorResponse = {
        success: false as const,
        error: 'Database connection failed'
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockErrorResponse as any);

      await expect(UtentiService.getUtenti()).rejects.toThrow('Database connection failed');
    });

    it('dovrebbe gestire dati vuoti', async () => {
      const mockResponse = {
        success: true as const,
        data: []
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse as any);

      const result = await UtentiService.getUtenti();

      expect(result).toEqual([]);
    });
  });

  describe('getUtenteByPin', () => {
    it('dovrebbe restituire il dipendente quando esiste', async () => {
      const mockResponse = {
        success: true as const,
        data: {
          pin: 7,
          nome: 'Anna',
          cognome: 'Bianchi',
          email: 'anna@example.com',
          telefono: '555',
          ore_contrattuali: 7.5,
          note: null,
          created_at: '2026-04-15T00:00:00Z',
          updated_at: null,
        },
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse as any);

      const result = await UtentiService.getUtenteByPin(7, 'trace-id');

      expect(safeFetchJson).toHaveBeenCalledWith('/api/utenti/7', {
        headers: { 'x-badgenode-trace': 'trace-id' },
      });
      expect(result).toMatchObject({ pin: 7, nome: 'Anna', cognome: 'Bianchi' });
    });

    it('dovrebbe restituire null se API risponde con errore', async () => {
      const mockErrorResponse = {
        success: false as const,
        error: 'Not found',
        code: 'NOT_FOUND',
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockErrorResponse as any);

      const result = await UtentiService.getUtenteByPin(99);

      expect(safeFetchJson).toHaveBeenCalledWith('/api/utenti/99', undefined);
      expect(result).toBeNull();
    });

    it('dovrebbe restituire null in caso di eccezione', async () => {
      vi.mocked(safeFetchJson).mockRejectedValue(new Error('network'));

      const result = await UtentiService.getUtenteByPin(5);

      expect(result).toBeNull();
    });
  });

  describe('isPinAvailable', () => {
    it('dovrebbe restituire true per PIN disponibile', async () => {
      const mockResponse = {
        success: true as const,
        data: { exists: false }
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse as any);

      const result = await UtentiService.isPinAvailable(99);

      expect(safeFetchJson).toHaveBeenCalledWith('/api/utenti/pin/99');
      expect(result.available).toBe(true);
    });

    it('dovrebbe restituire false per PIN già in uso', async () => {
      const mockResponse = {
        success: true as const,
        data: { exists: true }
      };

      vi.mocked(safeFetchJson).mockResolvedValue(mockResponse as any);

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
        success: true as const,
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
        ore_contrattuali: 8,
        descrizione_contratto: 'Full-time'
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockResponse as any);

      const result = await UtentiService.upsertUtente(utenteData);

      expect(safeFetchJsonPost).toHaveBeenCalledWith('/api/utenti', {
        pin: 50,
        nome: 'Nuovo',
        cognome: 'Utente',
        ore_contrattuali: 8,
        email: 'nuovo@test.com',
        telefono: '987654321'
      });
      expect(result).toMatchObject({
        id: '50',
        pin: 50,
        nome: 'Nuovo',
        cognome: 'Utente'
      });
    });

    it('dovrebbe gestire errore di validazione', async () => {
      const mockErrorResponse = {
        success: false as const,
        error: 'PIN already exists',
        code: 'VALIDATION_ERROR'
      };

      const utenteData = {
        pin: 1,
        nome: 'Test',
        cognome: 'User',
        email: '',
        telefono: '',
        ore_contrattuali: 8,
        descrizione_contratto: ''
      };

      vi.mocked(safeFetchJsonPost).mockResolvedValue(mockErrorResponse as any);

      await expect(UtentiService.createUtente(utenteData)).rejects.toThrow('PIN already exists');
    });
  });

  describe('deleteUtente', () => {
    it('dovrebbe eliminare utente con successo', async () => {
      const mockResponse = {
        success: true as const,
        data: undefined,
      };

      vi.mocked(safeFetchJsonDelete).mockResolvedValue(mockResponse as any);

      await UtentiService.deleteUtente(99);

      expect(safeFetchJsonDelete).toHaveBeenCalledWith('/api/utenti/99');
      // deleteUtente non restituisce nulla, solo non lancia errori
    });

    it('dovrebbe gestire utente non trovato', async () => {
      const mockErrorResponse = {
        success: false as const,
        error: 'User not found',
        code: 'NOT_FOUND'
      };

      vi.mocked(safeFetchJsonDelete).mockResolvedValue(mockErrorResponse as any);

      await expect(UtentiService.deleteUtente(99)).rejects.toThrow('User not found');
    });

    it('dovrebbe gestire PIN non valido', async () => {
      await expect(UtentiService.deleteUtente(0)).rejects.toThrow('PIN non valido');
      await expect(UtentiService.deleteUtente(100)).rejects.toThrow('PIN non valido');
    });
  });
});
