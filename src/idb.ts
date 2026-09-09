// Minimal IndexedDB wrapper for the binary data localStorage can't hold:
// uploaded Sueños images and the meditation audio track. localStorage is a
// ~5MB text-only store — fine for the JSON app state, hopeless for photos
// or a song. IndexedDB has no such practical size ceiling and stores Blobs
// natively, and (unlike a blob: object URL) what it stores survives a
// reload, a browser restart, or the tab being closed.

const DB_NAME = 'deltraos-media';
const DB_VERSION = 1;
export const STORE_DREAMS = 'dreamImages';
export const STORE_AUDIO = 'audio';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_DREAMS)) db.createObjectStore(STORE_DREAMS);
        if (!db.objectStoreNames.contains(STORE_AUDIO)) db.createObjectStore(STORE_AUDIO);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function withStore<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  return withStore<T>(store, 'readonly', (s) => s.get(key));
}

export function idbSet(store: string, key: string, value: unknown): Promise<void> {
  return withStore(store, 'readwrite', (s) => s.put(value, key)).then(() => undefined);
}

export function idbDelete(store: string, key: string): Promise<void> {
  return withStore(store, 'readwrite', (s) => s.delete(key)).then(() => undefined);
}

export function idbGetAllKeys(store: string): Promise<IDBValidKey[]> {
  return withStore(store, 'readonly', (s) => s.getAllKeys());
}
