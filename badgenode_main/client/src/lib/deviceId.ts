// client/src/lib/deviceId.ts
// Gestione DEVICE_ID persistente (localStorage) - Step 1 (no side effects se non usato)

const STORAGE_KEY = 'BADGENODE_DEVICE_ID';
const LEGACY_STORAGE_KEY = 'BN_DEVICE_ID';
type GlobalDeviceIdStore = typeof globalThis & { __BADGENODE_DEVICE_ID__?: string };

function uuidv4(): string {
  // RFC4122 v4 via Web Crypto se disponibile, altrimenti fallback
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    // Variante e versione bits
    buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // variant 10
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const hex = Array.from(buf, toHex).join('');
    return (
      hex.substring(0, 8) +
      '-' +
      hex.substring(8, 12) +
      '-' +
      hex.substring(12, 16) +
      '-' +
      hex.substring(16, 20) +
      '-' +
      hex.substring(20)
    );
  }
  // Fallback non-crypto (meno robusto ma accettabile per step 1)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length > 0) return existing;
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && legacy.length > 0) {
      localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
    const generated = `BN_DEV_${uuidv4().split('-')[0]}`;
    localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch {
    // In ambienti senza localStorage
    const g = globalThis as GlobalDeviceIdStore;
    let _fallback = g.__BADGENODE_DEVICE_ID__;
    if (!_fallback) {
      _fallback = uuidv4();
      g.__BADGENODE_DEVICE_ID__ = _fallback;
    }
    return _fallback;
  }
}
