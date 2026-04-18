// PIN validation utilities for client
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

export function validatePinInput(pin: number | string | null | undefined): string | null {
  if (!isValidPin(pin)) {
    return 'PIN deve essere tra 1 e 99';
  }
  return null;
}

export const PIN_ERROR_MESSAGE = 'PIN deve essere tra 1 e 99';
