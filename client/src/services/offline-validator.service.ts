// Validatore offline per business logic timbrature
// Non-invasivo: validazione aggiuntiva con fallback sicuro

import { TimbratureCacheService } from './timbrature-cache.service';

interface ValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
}

export class OfflineValidatorService {
  /**
   * Valida alternanza ENTRATA/USCITA per modalità offline
   * Fallback sicuro: se cache non disponibile, permetti (modalità permissiva)
   */
  static async validateAlternanza(pin: number, nuovoTipo: 'entrata' | 'uscita'): Promise<ValidationResult> {
    try {
      // Feature flag check - se disabilitato, permetti sempre
      const validationEnabled = String(import.meta.env?.VITE_OFFLINE_VALIDATION_ENABLED ?? 'true') === 'true';
      if (!validationEnabled) {
        return { valid: true };
      }

      const ultimaTimbratura = await TimbratureCacheService.getUltimaTimbratura(pin);
      
      // Se non c'è cache, modalità permissiva (primo utilizzo o cache scaduta)
      if (!ultimaTimbratura) {
        if (import.meta.env.DEV) {
          console.debug('[OfflineValidator] No cache found for PIN', pin, '- allowing', nuovoTipo);
        }
        return { valid: true };
      }

      // Controllo alternanza: ENTRATA → USCITA → ENTRATA
      if (ultimaTimbratura.tipo === nuovoTipo) {
        const expectedNext = ultimaTimbratura.tipo === 'entrata' ? 'uscita' : 'entrata';
        
        if (import.meta.env.DEV) {
          console.debug('[OfflineValidator] Alternanza violation:', {
            pin,
            ultima: ultimaTimbratura.tipo,
            nuovo: nuovoTipo,
            expected: expectedNext
          });
        }

        return {
          valid: false,
          code: 'ALTERNANZA_VIOLATION',
          message: `Alternanza violata: ultima timbratura è già ${ultimaTimbratura.tipo}. Attesa: ${expectedNext}.`
        };
      }

      // Validazione passata
      if (import.meta.env.DEV) {
        console.debug('[OfflineValidator] Alternanza valid:', {
          pin,
          ultima: ultimaTimbratura.tipo,
          nuovo: nuovoTipo
        });
      }

      return { valid: true };

    } catch (error) {
      // Fallback sicuro: in caso di errore, permetti (non bloccare utente)
      if (import.meta.env.DEV) {
        console.debug('[OfflineValidator] Validation error, allowing:', (error as Error)?.message);
      }
      return { valid: true };
    }
  }

  /**
   * Calcola giorno logico per timbratura offline
   * Usa logica semplificata: cutoff 05:00
   */
  static calculateGiornoLogico(timestamp: Date = new Date()): string {
    try {
      const date = new Date(timestamp);
      
      // Se ora < 05:00, appartiene al giorno precedente
      if (date.getHours() < 5) {
        date.setDate(date.getDate() - 1);
      }

      // Formato YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      // Fallback: usa data corrente
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Validazione completa offline (alternanza + giorno logico)
   * Entry point principale per validazione offline
   */
  static async validateOfflineTimbratura(pin: number, tipo: 'entrata' | 'uscita'): Promise<ValidationResult> {
    try {
      // Controllo alternanza
      const alternanzaResult = await this.validateAlternanza(pin, tipo);
      if (!alternanzaResult.valid) {
        return alternanzaResult;
      }

      // Calcolo giorno logico (per future validazioni)
      const giornoLogico = this.calculateGiornoLogico();
      
      if (import.meta.env.DEV) {
        console.debug('[OfflineValidator] Validation passed:', {
          pin,
          tipo,
          giornoLogico
        });
      }

      return { valid: true };

    } catch (error) {
      // Fallback sicuro: permetti in caso di errore
      if (import.meta.env.DEV) {
        console.debug('[OfflineValidator] Validation failed, allowing:', (error as Error)?.message);
      }
      return { valid: true };
    }
  }

  /**
   * Aggiorna cache dopo timbratura riuscita
   * Chiamata dopo successo per mantenere cache aggiornata
   */
  static async updateCacheAfterSuccess(pin: number, tipo: 'entrata' | 'uscita'): Promise<void> {
    try {
      const giornoLogico = this.calculateGiornoLogico();
      await TimbratureCacheService.updateCache(pin, tipo, giornoLogico);
    } catch (error) {
      // Fallback sicuro: cache update non critico
      if (import.meta.env.DEV) {
        console.debug('[OfflineValidator] Cache update failed:', (error as Error)?.message);
      }
    }
  }
}
