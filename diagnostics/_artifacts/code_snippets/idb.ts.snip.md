# client/src/offline/idb.ts

## IndexedDB Setup (righe 20-46)

```typescript
export async function idbOpen(): Promise<IDBDatabase> {
  if (!hasIDB()) throw new Error('indexedDB unavailable');
  return new Promise((resolve, reject) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, 2); // Increment version for safe upgrade
    } catch (e) {
      reject(e);
      return;
    }
    req.onupgradeneeded = () => {
      try {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_TIMBRI)) {
          const os = db.createObjectStore(STORE_TIMBRI, { keyPath: 'client_seq' });
          os.createIndex('by_ts', 'ts_client_ms', { unique: false });
          os.createIndex('status_idx', 'status', { unique: false });
          os.createIndex('client_seq_idx', 'client_seq', { unique: true });
        }
      } catch (e) {
        // swallow upgrade errors, fallback will catch later
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
```

## In-Memory Fallback (righe 15-18)

```typescript
const memDB: Record<string, any[]> = {
  [STORE_TIMBRI]: [],
};
```

**ANALISI**: IndexedDB con fallback in-memory. Dovrebbe essere sicuro.
