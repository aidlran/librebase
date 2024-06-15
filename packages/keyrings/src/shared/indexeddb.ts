const connections: Record<string, IDBDatabase> = {};

/** @deprecated Use IndexedDB ChannelDriver. */
export function open(
  name: string,
  objectStores: [string, IDBObjectStoreParameters?][],
  version?: number,
) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      connections[name] = request.result;
      resolve();
    };
    request.onupgradeneeded = () => {
      for (const [name, params] of objectStores) {
        request.result.createObjectStore(name, params);
      }
    };
  });
}

function getConnection(name: string) {
  const connection = connections[name];
  if (!connection) throw ReferenceError(`Database '${name}' not open`);
  return connection;
}

/** @deprecated Use IndexedDB ChannelDriver. */
export function deleteRecord(db: string, store: string, key: IDBValidKey) {
  return new Promise<void>((resolve, reject) => {
    const connection = getConnection(db);
    const request = connection.transaction(store, 'readwrite').objectStore(store).delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/** @deprecated Use IndexedDB ChannelDriver. */
export function getRecord<T>(db: string, store: string, key: IDBValidKey | IDBKeyRange) {
  return new Promise<T>((resolve, reject) => {
    const connection = getConnection(db);
    const request = connection.transaction(store, 'readonly').objectStore(store).get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T);
  });
}

/** @deprecated Use IndexedDB ChannelDriver. */
export async function getAllRecords<T>(
  db: string,
  store: string,
  query?: IDBValidKey | IDBKeyRange,
  count?: number,
) {
  return new Promise<T[]>((resolve, reject) => {
    const connection = getConnection(db);
    const request = connection
      .transaction(store, 'readonly')
      .objectStore(store)
      .getAll(query, count);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/** @deprecated Use IndexedDB ChannelDriver. */
export async function putRecord<T extends IDBValidKey = IDBValidKey>(
  db: string,
  name: string,
  value: unknown,
  key?: T,
) {
  return new Promise<T>((resolve, reject) => {
    const connection = getConnection(db);
    const request = connection.transaction(name, 'readwrite').objectStore(name).put(value, key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T);
  });
}
