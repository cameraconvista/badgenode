// PIN validation utilities for server
export function isValidPin(pin: number | string | null | undefined): boolean {
  if (pin === null || pin === undefined) return false;
  if (typeof pin === 'string') {
    const normalized = pin.trim();
    if (!/^\d{1,2}$/.test(normalized)) return false;
    const pinNum = Number(normalized);
    return Number.isInteger(pinNum) && pinNum >= 1 && pinNum <= 99;
  }
  return Number.isInteger(pin) && pin >= 1 && pin <= 99;
}

export function validatePinParam(pin: string | undefined): { valid: boolean; pinNum?: number; error?: string } {
  if (!pin) {
    return { valid: false, error: 'Parametro PIN obbligatorio' };
  }

  const normalized = pin.trim();
  if (!isValidPin(normalized)) {
    return { valid: false, error: 'PIN deve essere tra 1 e 99' };
  }

  const pinNum = Number(normalized);
  return { valid: true, pinNum };
}

export const PIN_VALIDATION_ERROR = 'PIN deve essere tra 1 e 99';
export const PIN_MISSING_ERROR = 'Parametro PIN obbligatorio';
