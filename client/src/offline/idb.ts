// client/src/offline/idb.ts
// Minimal IndexedDB wrapper (no external deps)
// DB: badgenode_offline, Store: timbri_v1 (keyPath: client_seq)

const DB_NAME = 'badgenode_offline';
const DB_VERSION = 1;
export const STORE_TIMBRI = 'timbri_v1' as const;

export type StoreName = typeof STORE_TIMBRI;

function hasIDB(): boolean {
  return typeof indexedDB !== 'undefined' && !!indexedDB.open;
}

// In-memory fallback (soft) when IDB is unavailable (e.g., private mode or SSR)
const memDB: Record<string, any[]> = {
  [STORE_TIMBRI]: [],
};

export async function idbOpen(): Promise<IDBDatabase> {
  if (!hasIDB()) throw new Error('indexedDB unavailable');
  return new Promise((resolve, reject) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(e);
      return;
    }
    req.onupgradeneeded = () => {
      try {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_TIMBRI)) {
          const store = db.createObjectStore(STORE_TIMBRI, { keyPath: 'client_seq' });
          store.createIndex('status_idx', 'status', { unique: false });
          store.createIndex('client_seq_idx', 'client_seq', { unique: true });
        }
      } catch (e) {
        // swallow upgrade errors, fallback will catch later
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withTx(db: IDBDatabase, store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => void): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(store, mode);
      const st = tx.objectStore(store);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      fn(st);
    } catch (e) {
      reject(e);
    }
  });
}

export async function idbAdd<T extends { client_seq: number }>(store: StoreName, value: T): Promise<void> {
  if (!hasIDB()) {
    const arr = memDB[store] as T[];
    arr.push(value);
    return;
  }
  const db = await idbOpen();
  return withTx(db, store, 'readwrite', (s) => { s.add(value); });
}

export async function idbPut<T extends { client_seq: number }>(store: StoreName, value: T): Promise<void> {
  if (!hasIDB()) {
    const arr = memDB[store] as T[];
    const i = arr.findIndex((x) => x.client_seq === value.client_seq);
    if (i >= 0) arr[i] = value; else arr.push(value);
    return;
  }
  const db = await idbOpen();
  return withTx(db, store, 'readwrite', (s) => { s.put(value); });
}

export async function idbDelete(store: StoreName, key: number): Promise<void> {
  if (!hasIDB()) {
    const arr = memDB[store];
    const i = arr.findIndex((x: any) => x.client_seq === key);
    if (i >= 0) arr.splice(i, 1);
    return;
  }
  const db = await idbOpen();
  return withTx(db, store, 'readwrite', (s) => { s.delete(key); });
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  if (!hasIDB()) {
    const arr = memDB[store] as T[];
    return Promise.resolve([...(arr || [])]);
  }
  const db = await idbOpen();
  return new Promise<T[]>((resolve, reject) => {
    try {
      const tx = db.transaction(store, 'readonly');
      const st = tx.objectStore(store);
      const req = st.getAll();
      req.onsuccess = () => resolve((req.result || []) as T[]);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function idbCount(store: StoreName): Promise<number> {
  if (!hasIDB()) {
    const arr = memDB[store];
    return Promise.resolve((arr || []).length);
  }
  const db = await idbOpen();
  return new Promise<number>((resolve, reject) => {
    try {
      const tx = db.transaction(store, 'readonly');
      const st = tx.objectStore(store);
      const req = st.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}
