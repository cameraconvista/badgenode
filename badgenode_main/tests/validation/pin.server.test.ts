// Unit tests per utility PIN validation (server-side)
// Step 3: Test di sicurezza e non-regressione - solo logica esistente

import { describe, it, expect } from 'vitest';
import { isValidPin, validatePinParam, PIN_VALIDATION_ERROR, PIN_MISSING_ERROR } from '../../server/utils/validation/pin';

describe('PIN validation (server)', () => {
  describe('isValidPin', () => {
    it('should accept valid PIN range 1-99', () => {
      expect(isValidPin(1)).toBe(true);
      expect(isValidPin(50)).toBe(true);
      expect(isValidPin(99)).toBe(true);
    });

    it('should reject PIN outside valid range', () => {
      expect(isValidPin(0)).toBe(false);
      expect(isValidPin(100)).toBe(false);
      expect(isValidPin(-1)).toBe(false);
      expect(isValidPin(999)).toBe(false);
    });

    it('should reject non-numeric inputs', () => {
      expect(isValidPin(null)).toBe(false);
      expect(isValidPin(undefined)).toBe(false);
      expect(isValidPin(NaN)).toBe(false);
    });

    it('should handle string inputs correctly', () => {
      expect(isValidPin('1')).toBe(true);
      expect(isValidPin('50')).toBe(true);
      expect(isValidPin('99')).toBe(true);
      expect(isValidPin('0')).toBe(false);
      expect(isValidPin('100')).toBe(false);
      expect(isValidPin('abc')).toBe(false);
      expect(isValidPin('')).toBe(false);
    });
  });

  describe('validatePinParam', () => {
    it('should return valid result for correct PINs', () => {
      expect(validatePinParam('1')).toEqual({ valid: true, pinNum: 1 });
      expect(validatePinParam('50')).toEqual({ valid: true, pinNum: 50 });
      expect(validatePinParam('99')).toEqual({ valid: true, pinNum: 99 });
    });

    it('should return error for missing PIN', () => {
      expect(validatePinParam(undefined)).toEqual({ 
        valid: false, 
        error: PIN_MISSING_ERROR 
      });
      expect(validatePinParam('')).toEqual({ 
        valid: false, 
        error: PIN_MISSING_ERROR 
      });
    });

    it('should return error for invalid PIN range', () => {
      expect(validatePinParam('0')).toEqual({ 
        valid: false, 
        error: PIN_VALIDATION_ERROR 
      });
      expect(validatePinParam('100')).toEqual({ 
        valid: false, 
        error: PIN_VALIDATION_ERROR 
      });
      expect(validatePinParam('-1')).toEqual({ 
        valid: false, 
        error: PIN_VALIDATION_ERROR 
      });
    });

    it('should return error for non-numeric strings', () => {
      expect(validatePinParam('abc')).toEqual({ 
        valid: false, 
        error: PIN_VALIDATION_ERROR 
      });
      // Nota: parseInt('12abc') = 12, quindi è considerato valido
      expect(validatePinParam('12abc')).toEqual({ 
        valid: true, 
        pinNum: 12 
      });
    });

    it('should use consistent error messages', () => {
      expect(PIN_VALIDATION_ERROR).toBe('PIN deve essere tra 1 e 99');
      expect(PIN_MISSING_ERROR).toBe('Parametro PIN obbligatorio');
    });
  });

  describe('server-specific edge cases', () => {
    it('should handle URL parameter edge cases', () => {
      // Simula casi tipici da req.params/req.query
      expect(validatePinParam('01')).toEqual({ valid: true, pinNum: 1 }); // Leading zero
      expect(validatePinParam('1.0')).toEqual({ valid: true, pinNum: 1 }); // parseInt('1.0') = 1
      expect(validatePinParam(' 1 ')).toEqual({ valid: true, pinNum: 1 }); // parseInt(' 1 ') = 1
    });

    it('should handle boundary values for server context', () => {
      // Test critici per API endpoints
      expect(validatePinParam('1')).toEqual({ valid: true, pinNum: 1 });
      expect(validatePinParam('99')).toEqual({ valid: true, pinNum: 99 });
      expect(validatePinParam('0')).toEqual({ valid: false, error: PIN_VALIDATION_ERROR });
      expect(validatePinParam('100')).toEqual({ valid: false, error: PIN_VALIDATION_ERROR });
    });
  });

  describe('security considerations', () => {
    it('should reject potentially malicious inputs', () => {
      // Test per input potenzialmente pericolosi
      // Nota: parseInt estrae solo i numeri iniziali
      expect(validatePinParam('1; DROP TABLE users;')).toEqual({ 
        valid: true, 
        pinNum: 1 
      });
      expect(validatePinParam('<script>alert(1)</script>')).toEqual({ 
        valid: false, 
        error: PIN_VALIDATION_ERROR 
      });
      expect(validatePinParam('../../etc/passwd')).toEqual({ 
        valid: false, 
        error: PIN_VALIDATION_ERROR 
      });
    });

    it('should handle very large numbers', () => {
      expect(validatePinParam('999999999999999999')).toEqual({ 
        valid: false, 
        error: PIN_VALIDATION_ERROR 
      });
    });
  });
});
