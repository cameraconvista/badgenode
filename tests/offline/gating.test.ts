// Test della logica pura di gating offline (whitelist device).
// Verifica i casi critici: device assente, wildcard, case-insensitive, lista vuota.
// Mocka featureFlags per controllare la whitelist senza dipendere dall'env.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del modulo featureFlags: controlliamo whitelist e flag globale.
vi.mock('@/config/featureFlags', () => {
  return {
    featureFlags: { whitelist: '' },
    isOfflineQueueEnabled: vi.fn(() => true),
  };
});

import { isDeviceAllowed, getWhitelistedDevices, isOfflineEnabled } from '@/offline/gating';
import { featureFlags, isOfflineQueueEnabled } from '@/config/featureFlags';

describe('gating offline — isDeviceAllowed', () => {
  beforeEach(() => {
    (featureFlags as { whitelist: string }).whitelist = '';
    vi.mocked(isOfflineQueueEnabled).mockReturnValue(true);
  });

  it('device vuoto non è mai abilitato', () => {
    (featureFlags as { whitelist: string }).whitelist = 'dev1';
    expect(isDeviceAllowed('')).toBe(false);
  });

  it('whitelist vuota: nessun device abilitato', () => {
    (featureFlags as { whitelist: string }).whitelist = '';
    expect(isDeviceAllowed('dev1')).toBe(false);
  });

  it('device presente in whitelist è abilitato', () => {
    (featureFlags as { whitelist: string }).whitelist = 'dev1,dev2';
    expect(isDeviceAllowed('dev2')).toBe(true);
  });

  it('match case-insensitive', () => {
    (featureFlags as { whitelist: string }).whitelist = 'DEV-ABC';
    expect(isDeviceAllowed('dev-abc')).toBe(true);
  });

  it('wildcard * abilita qualsiasi device', () => {
    (featureFlags as { whitelist: string }).whitelist = '*';
    expect(isDeviceAllowed('qualsiasi-device')).toBe(true);
  });

  it('device non in whitelist non è abilitato', () => {
    (featureFlags as { whitelist: string }).whitelist = 'dev1';
    expect(isDeviceAllowed('dev99')).toBe(false);
  });
});

describe('gating offline — getWhitelistedDevices', () => {
  it('normalizza spazi e maiuscole, scarta vuoti', () => {
    (featureFlags as { whitelist: string }).whitelist = ' Dev1 , , DEV2 ';
    expect(getWhitelistedDevices()).toEqual(['dev1', 'dev2']);
  });
});

describe('gating offline — isOfflineEnabled', () => {
  it('feature globale OFF → sempre disabilitato anche se device whitelisted', () => {
    (featureFlags as { whitelist: string }).whitelist = '*';
    vi.mocked(isOfflineQueueEnabled).mockReturnValue(false);
    expect(isOfflineEnabled('dev1')).toBe(false);
  });

  it('feature ON + device whitelisted → abilitato', () => {
    (featureFlags as { whitelist: string }).whitelist = 'dev1';
    vi.mocked(isOfflineQueueEnabled).mockReturnValue(true);
    expect(isOfflineEnabled('dev1')).toBe(true);
  });
});
