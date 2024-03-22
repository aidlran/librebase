const connections: Record<string, IDBDatabase> = {};

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

export function deleteObject(db: string, store: string, key: IDBValidKey) {
  const connection = getConnection(db);
  return new Promise<void>((resolve, reject) => {
    const request = connection.transaction(store, 'readwrite').objectStore(store).delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export function getObject<T>(db: string, store: string, key: IDBValidKey | IDBKeyRange) {
  const connection = getConnection(db);
  return new Promise<T>((resolve, reject) => {
    const request = connection.transaction(store, 'readonly').objectStore(store).get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T);
  });
}

export async function getAllObjects<T>(
  db: string,
  store: string,
  query?: IDBValidKey | IDBKeyRange,
  count?: number,
) {
  const connection = getConnection(db);
  return new Promise<T[]>((resolve, reject) => {
    const request = connection
      .transaction(store, 'readonly')
      .objectStore(store)
      .getAll(query, count);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function putObject<T extends IDBValidKey = IDBValidKey>(
  db: string,
  name: string,
  value: unknown,
  key?: T,
) {
  const connection = getConnection(db);
  return new Promise<T>((resolve, reject) => {
    const request = connection.transaction(name, 'readwrite').objectStore(name).put(value, key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T);
  });
}
