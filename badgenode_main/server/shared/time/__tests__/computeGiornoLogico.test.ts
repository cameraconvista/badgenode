import { describe, it, expect } from 'vitest';
import { computeGiornoLogico, type ComputeGiornoLogicoParams } from '../computeGiornoLogico';

describe('computeGiornoLogico', () => {
  describe('ENTRATA - Cutoff 05:00', () => {
    it('dovrebbe assegnare al giorno precedente per entrata 00:00-04:59', () => {
      const testCases: Array<{ ora: string; expected: string }> = [
        { ora: '00:00:00', expected: '2025-10-20' },
        { ora: '02:30:00', expected: '2025-10-20' },
        { ora: '04:59:00', expected: '2025-10-20' },
      ];

      testCases.forEach(({ ora, expected }) => {
        const params: ComputeGiornoLogicoParams = {
          data: '2025-10-21',
          ora,
          tipo: 'entrata'
        };

        const result = computeGiornoLogico(params);
        expect(result.giorno_logico).toBe(expected);
        expect(result.dataReale).toBe('2025-10-21');
      });
    });

    it('dovrebbe assegnare allo stesso giorno per entrata 05:00-23:59', () => {
      const testCases: Array<{ ora: string; expected: string }> = [
        { ora: '05:00:00', expected: '2025-10-21' },
        { ora: '08:00:00', expected: '2025-10-21' },
        { ora: '12:30:00', expected: '2025-10-21' },
        { ora: '23:59:00', expected: '2025-10-21' },
      ];

      testCases.forEach(({ ora, expected }) => {
        const params: ComputeGiornoLogicoParams = {
          data: '2025-10-21',
          ora,
          tipo: 'entrata'
        };

        const result = computeGiornoLogico(params);
        expect(result.giorno_logico).toBe(expected);
        expect(result.dataReale).toBe('2025-10-21');
      });
    });
  });

  describe('USCITA - Ancoraggio e Cross-midnight', () => {
    it('dovrebbe usare ancoraggio per uscita notturna con dataEntrata', () => {
      const params: ComputeGiornoLogicoParams = {
        data: '2025-10-22',
        ora: '02:00:00',
        tipo: 'uscita',
        dataEntrata: '2025-10-21'
      };

      const result = computeGiornoLogico(params);
      expect(result.giorno_logico).toBe('2025-10-21'); // Ancorata all'entrata
      expect(result.dataReale).toBe('2025-10-22');
    });

    it('dovrebbe fallback al giorno precedente per uscita notturna senza dataEntrata', () => {
      const params: ComputeGiornoLogicoParams = {
        data: '2025-10-22',
        ora: '03:30:00',
        tipo: 'uscita'
        // Nessuna dataEntrata
      };

      const result = computeGiornoLogico(params);
      expect(result.giorno_logico).toBe('2025-10-21'); // Giorno precedente
      expect(result.dataReale).toBe('2025-10-22');
    });

    it('dovrebbe assegnare allo stesso giorno per uscita 05:00-23:59', () => {
      const testCases: Array<{ ora: string; expected: string }> = [
        { ora: '05:00:00', expected: '2025-10-21' },
        { ora: '17:30:00', expected: '2025-10-21' },
        { ora: '23:59:00', expected: '2025-10-21' },
      ];

      testCases.forEach(({ ora, expected }) => {
        const params: ComputeGiornoLogicoParams = {
          data: '2025-10-21',
          ora,
          tipo: 'uscita'
        };

        const result = computeGiornoLogico(params);
        expect(result.giorno_logico).toBe(expected);
        expect(result.dataReale).toBe('2025-10-21');
      });
    });
  });

  describe('Edge Cases', () => {
    it('dovrebbe gestire correttamente il cutoff esatto 05:00', () => {
      const entrataParams: ComputeGiornoLogicoParams = {
        data: '2025-10-21',
        ora: '05:00:00',
        tipo: 'entrata'
      };

      const uscitaParams: ComputeGiornoLogicoParams = {
        data: '2025-10-21',
        ora: '05:00:00',
        tipo: 'uscita'
      };

      expect(computeGiornoLogico(entrataParams).giorno_logico).toBe('2025-10-21');
      expect(computeGiornoLogico(uscitaParams).giorno_logico).toBe('2025-10-21');
    });

    it('dovrebbe gestire correttamente il cutoff 04:59', () => {
      const entrataParams: ComputeGiornoLogicoParams = {
        data: '2025-10-21',
        ora: '04:59:00',
        tipo: 'entrata'
      };

      const uscitaParams: ComputeGiornoLogicoParams = {
        data: '2025-10-21',
        ora: '04:59:00',
        tipo: 'uscita'
      };

      expect(computeGiornoLogico(entrataParams).giorno_logico).toBe('2025-10-20');
      expect(computeGiornoLogico(uscitaParams).giorno_logico).toBe('2025-10-20');
    });

    it('dovrebbe gestire cambio mese/anno', () => {
      const params: ComputeGiornoLogicoParams = {
        data: '2025-01-01',
        ora: '02:00:00',
        tipo: 'entrata'
      };

      const result = computeGiornoLogico(params);
      expect(result.giorno_logico).toBe('2024-12-31');
      expect(result.dataReale).toBe('2025-01-01');
    });
  });

  describe('Scenari Turni Notturni', () => {
    it('dovrebbe gestire turno notturno completo', () => {
      // Entrata: 21 ottobre alle 22:00 → giorno_logico: 21 ottobre
      const entrata = computeGiornoLogico({
        data: '2025-10-21',
        ora: '22:00:00',
        tipo: 'entrata'
      });

      // Uscita: 22 ottobre alle 06:00 → giorno_logico: 21 ottobre (ancoraggio)
      const uscita = computeGiornoLogico({
        data: '2025-10-22',
        ora: '06:00:00',
        tipo: 'uscita',
        dataEntrata: entrata.giorno_logico
      });

      expect(entrata.giorno_logico).toBe('2025-10-21');
      expect(uscita.giorno_logico).toBe('2025-10-21');
    });

    it('dovrebbe gestire turno notturno con uscita prima delle 05:00', () => {
      // Entrata: 21 ottobre alle 23:00 → giorno_logico: 21 ottobre
      const entrata = computeGiornoLogico({
        data: '2025-10-21',
        ora: '23:00:00',
        tipo: 'entrata'
      });

      // Uscita: 22 ottobre alle 04:00 → giorno_logico: 21 ottobre (ancoraggio)
      const uscita = computeGiornoLogico({
        data: '2025-10-22',
        ora: '04:00:00',
        tipo: 'uscita',
        dataEntrata: entrata.giorno_logico
      });

      expect(entrata.giorno_logico).toBe('2025-10-21');
      expect(uscita.giorno_logico).toBe('2025-10-21');
    });
  });
});
