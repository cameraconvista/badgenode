// IndexedDB wrapper minimale per sync offline BadgeNode
// Gestione persistente coda timbrature con ordinamento

export class SyncDB {
  private db?: IDBDatabase;
  
  constructor(private name: string, private store: string) {}

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.name, 1);
      
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.store)) {
          const os = db.createObjectStore(this.store, { keyPath: 'client_event_id' });
          os.createIndex('created_local_ts', 'created_local_ts', { unique: false });
        }
      };
      
      req.onsuccess = () => { 
        this.db = req.result; 
        resolve(req.result); 
      };
      
      req.onerror = () => reject(req.error);
    });
  }

  async put<T extends { client_event_id: string }>(value: T): Promise<void> {
    const db = await this.open();
    
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.store, 'readwrite');
      tx.objectStore(this.store).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async delete(client_event_id: string): Promise<void> {
    const db = await this.open();
    
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.store, 'readwrite');
      tx.objectStore(this.store).delete(client_event_id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async all<T>(): Promise<T[]> {
    const db = await this.open();
    
    return new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(this.store, 'readonly');
      const store = tx.objectStore(this.store);
      const idx = store.index('created_local_ts');
      const req = idx.openCursor();
      const out: T[] = [];
      
      req.onsuccess = () => {
        const cur = req.result;
        if (cur) { 
          out.push(cur.value as T); 
          cur.continue(); 
        } else { 
          resolve(out); 
        }
      };
      
      req.onerror = () => reject(req.error);
    });
  }

  async count(): Promise<number> {
    const db = await this.open();
    
    return new Promise<number>((resolve, reject) => {
      const tx = db.transaction(this.store, 'readonly');
      const req = tx.objectStore(this.store).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
