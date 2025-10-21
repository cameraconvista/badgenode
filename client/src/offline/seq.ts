// client/src/offline/seq.ts
// Contatore sequenziale locale (single-device) per client_seq

const LS_KEY = 'BADGENODE_OFFLINE_CLIENT_SEQ_V1';

function readSeq(): number {
  try {
    const v = localStorage.getItem(LS_KEY);
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    const g = (globalThis as any);
    if (typeof g.__BN_SEQ__ !== 'number') g.__BN_SEQ__ = 0;
    return g.__BN_SEQ__;
  }
}

function writeSeq(n: number): void {
  try {
    localStorage.setItem(LS_KEY, String(n));
  } catch {
    (globalThis as any).__BN_SEQ__ = n;
  }
}

export function nextClientSeq(): number {
  const cur = readSeq();
  const nx = cur + 1;
  writeSeq(nx);
  return nx;
}

export function peekClientSeq(): number {
  return readSeq();
}
