let connection: Promise<IDBDatabase>;

let objectStores: undefined | Record<string, IDBObjectStoreParameters> = {};

export function registerObjectStore(name: string, options: IDBObjectStoreParameters) {
  if (objectStores) {
    objectStores[name] = options;
  } else {
    throw new Error('Connection was already opened');
  }
}

function onUpgradeNeeded(this: IDBOpenDBRequest) {
  for (const [name, params] of Object.entries(objectStores!)) {
    this.result.createObjectStore(name, params);
  }
  objectStores = undefined;
}

function wrapOnError(reject: (reason: unknown) => void) {
  return function (this: IDBRequest) {
    reject(this.error);
  };
}

function wrapOnSuccess<T>(resolve: (value: T) => void) {
  return function (this: IDBRequest) {
    resolve(this.result as T);
  };
}

function getConnection() {
  return (connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    const dbOpenRequest = indexedDB.open('librebase');
    dbOpenRequest.onupgradeneeded = onUpgradeNeeded;
    dbOpenRequest.onerror = wrapOnError(reject);
    dbOpenRequest.onsuccess = wrapOnSuccess(resolve);
  }));
}

export async function getObject<T>(name: string, key: IDBValidKey | IDBKeyRange) {
  const db = await getConnection();
  return new Promise<T>((resolve, reject) => {
    const request = db.transaction(name, 'readonly').objectStore(name).get(key);
    request.onerror = wrapOnError(reject);
    request.onsuccess = wrapOnSuccess(resolve);
  });
}

export async function getAllObjects<T>(
  name: string,
  query?: IDBValidKey | IDBKeyRange,
  count?: number,
) {
  const db = await getConnection();
  return new Promise<T[]>((resolve, reject) => {
    const request = db.transaction(name, 'readonly').objectStore(name).getAll(query, count);
    request.onerror = wrapOnError(reject);
    request.onsuccess = wrapOnSuccess(resolve);
  });
}

export async function putObject<T extends IDBValidKey>(
  name: string,
  value: unknown,
  key?: IDBValidKey,
) {
  const db = await getConnection();
  return new Promise<T>((resolve, reject) => {
    const request = db.transaction(name, 'readwrite').objectStore(name).put(value, key);
    request.onerror = wrapOnError(reject);
    request.onsuccess = wrapOnSuccess(resolve);
  });
}
