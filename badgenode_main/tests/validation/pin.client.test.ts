// Unit tests per utility PIN validation (client-side)
// Step 3: Test di sicurezza e non-regressione - solo logica esistente

import { describe, it, expect } from 'vitest';
import { isValidPin, validatePinInput, PIN_ERROR_MESSAGE } from '../../client/src/utils/validation/pin';

describe('PIN validation (client)', () => {
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

  describe('validatePinInput', () => {
    it('should return null for valid PINs', () => {
      expect(validatePinInput(1)).toBe(null);
      expect(validatePinInput(50)).toBe(null);
      expect(validatePinInput(99)).toBe(null);
      expect(validatePinInput('1')).toBe(null);
      expect(validatePinInput('99')).toBe(null);
    });

    it('should return error message for invalid PINs', () => {
      expect(validatePinInput(0)).toBe(PIN_ERROR_MESSAGE);
      expect(validatePinInput(100)).toBe(PIN_ERROR_MESSAGE);
      expect(validatePinInput(null)).toBe(PIN_ERROR_MESSAGE);
      expect(validatePinInput(undefined)).toBe(PIN_ERROR_MESSAGE);
      expect(validatePinInput('abc')).toBe(PIN_ERROR_MESSAGE);
    });

    it('should use consistent error message', () => {
      expect(PIN_ERROR_MESSAGE).toBe('PIN deve essere tra 1 e 99');
      expect(validatePinInput(0)).toBe('PIN deve essere tra 1 e 99');
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Boundary testing per range 1-99
      expect(isValidPin(1)).toBe(true);   // Lower bound
      expect(isValidPin(99)).toBe(true);  // Upper bound
      expect(isValidPin(0)).toBe(false);  // Below lower bound
      expect(isValidPin(100)).toBe(false); // Above upper bound
    });

    it('should handle floating point numbers', () => {
      // Nota: la funzione usa il valore originale per il range check, non parseInt
      expect(isValidPin(1.5)).toBe(true);   // 1.5 >= 1 && 1.5 <= 99 = true
      expect(isValidPin(50.0)).toBe(true);  // Integer as float
      expect(isValidPin(0.5)).toBe(false);  // 0.5 < 1 = false
      expect(isValidPin(99.9)).toBe(false); // 99.9 > 99 = false
    });
  });
});
