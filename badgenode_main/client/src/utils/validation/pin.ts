// PIN validation utilities for client
export function isValidPin(pin: number | string | null | undefined): boolean {
  if (pin === null || pin === undefined) return false;
  const pinNum = typeof pin === 'string' ? parseInt(pin, 10) : pin;
  return !isNaN(pinNum) && pinNum >= 1 && pinNum <= 99;
}

export function validatePinInput(pin: number | string | null | undefined): string | null {
  if (!isValidPin(pin)) {
    return 'PIN deve essere tra 1 e 99';
  }
  return null;
}

export const PIN_ERROR_MESSAGE = 'PIN deve essere tra 1 e 99';
