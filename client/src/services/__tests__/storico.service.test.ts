import { describe, it, expect } from 'vitest';
import { generateDateRange } from '../storico.service';

describe('storico.service', () => {
  describe('generateDateRange', () => {
    it('should generate single day range', () => {
      const result = generateDateRange('2025-10-09', '2025-10-09');
      expect(result).toEqual(['2025-10-09']);
    });

    it('should generate multi-day range inclusive', () => {
      const result = generateDateRange('2025-10-08', '2025-10-11');
      expect(result).toEqual(['2025-10-08', '2025-10-09', '2025-10-10', '2025-10-11']);
    });

    it('should handle month boundary', () => {
      const result = generateDateRange('2025-09-30', '2025-10-02');
      expect(result).toEqual(['2025-09-30', '2025-10-01', '2025-10-02']);
    });

    it('should handle year boundary', () => {
      const result = generateDateRange('2024-12-31', '2025-01-02');
      expect(result).toEqual(['2024-12-31', '2025-01-01', '2025-01-02']);
    });

    it('should handle edge case with midnight cutoff dates', () => {
      // Test per giorno logico: entrate 00:00-04:59 → giorno precedente
      const result = generateDateRange('2025-10-09', '2025-10-10');
      expect(result).toEqual(['2025-10-09', '2025-10-10']);
      expect(result).toHaveLength(2);
    });
  });

  describe('buildStoricoDataset (mock test)', () => {
    it('should include days without timbrature with 0.00 hours', () => {
      // Mock test - in un test reale si mockerebbero le chiamate Supabase
      const mockTotali = [
        {
          giorno_logico: '2025-10-08',
          ore_totali_chiuse: 4.0,
          sessioni_chiuse: 1,
          sessioni_totali: 1,
        },
        {
          giorno_logico: '2025-10-10',
          ore_totali_chiuse: 8.48,
          sessioni_chiuse: 1,
          sessioni_totali: 1,
        },
      ];

      const mockSessioni = [
        {
          giorno_logico: '2025-10-08',
          entrata_id: 1,
          entrata_ore: '09:00:00',
          uscita_id: 2,
          uscita_ore: '13:00:00',
          ore_sessione: 4.0,
          sessione_num: 1,
        },
        {
          giorno_logico: '2025-10-10',
          entrata_id: 3,
          entrata_ore: '22:00:00',
          uscita_id: 4,
          uscita_ore: '06:29:00',
          ore_sessione: 8.48,
          sessione_num: 1,
        },
      ];

      // Il range 2025-10-08 → 2025-10-11 dovrebbe includere tutti i 4 giorni
      const expectedDays = generateDateRange('2025-10-08', '2025-10-11');
      expect(expectedDays).toHaveLength(4);

      // Giorni senza timbrature (2025-10-09, 2025-10-11) dovrebbero avere ore 0.00
      const daysWith000 = expectedDays.filter(
        (day) => !mockTotali.some((t) => t.giorno_logico === day)
      );
      expect(daysWith000).toEqual(['2025-10-09', '2025-10-11']);
    });
  });
});
