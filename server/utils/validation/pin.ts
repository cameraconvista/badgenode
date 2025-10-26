// PIN validation utilities for server
export function isValidPin(pin: number | string | null | undefined): boolean {
  if (pin === null || pin === undefined) return false;
  const pinNum = typeof pin === 'string' ? parseInt(pin, 10) : pin;
  return !isNaN(pinNum) && pinNum >= 1 && pinNum <= 99;
}

export function validatePinParam(pin: string | undefined): { valid: boolean; pinNum?: number; error?: string } {
  if (!pin) {
    return { valid: false, error: 'Parametro PIN obbligatorio' };
  }
  
  const pinNum = parseInt(pin, 10);
  if (!isValidPin(pinNum)) {
    return { valid: false, error: 'PIN deve essere tra 1 e 99' };
  }
  
  return { valid: true, pinNum };
}

export const PIN_VALIDATION_ERROR = 'PIN deve essere tra 1 e 99';
export const PIN_MISSING_ERROR = 'Parametro PIN obbligatorio';
