export interface Session<T = unknown> {
  id: IDBValidKey;
  nonce: ArrayBuffer;
  salt: ArrayBuffer;
  payload: ArrayBuffer;
  metadata?: T;
  // TODO: `createdAt` & `updatedAt`?
}

export type ObjectStoreName = 'session';

type ObjectStoreEntryUnion<T extends ObjectStoreName> = { kind: T; value: unknown } & {
  kind: 'session';
  value: Session;
};

export const SESSION_OBJECT_STORE_NAME = 'session';

const getConnection = (() => {
  let connection: IDBDatabase;
  return async () =>
    (connection ??= await new Promise<IDBDatabase>((resolve, reject) => {
      const dbOpenRequest = indexedDB.open('librebase', 1);

      dbOpenRequest.onupgradeneeded = () => {
        dbOpenRequest.result.createObjectStore(SESSION_OBJECT_STORE_NAME, {
          autoIncrement: true,
          keyPath: 'id',
        });
      };

      dbOpenRequest.onerror = () => {
        reject(dbOpenRequest.error ?? new Error());
      };

      dbOpenRequest.onsuccess = () => {
        resolve(dbOpenRequest.result);
      };
    }));
})();

// TODO: consider using callbacks for better performance
// Manipulating sessions is not something we do much, so this is fine

export function create<T extends ObjectStoreName>(
  objectStoreName: T,
  value: Omit<ObjectStoreEntryUnion<T>['value'], 'id'>,
): Promise<IDBValidKey> {
  return getConnection().then(
    (database) =>
      new Promise<IDBValidKey>((resolve, reject) => {
        const request = database
          .transaction(objectStoreName, 'readwrite')
          .objectStore(objectStoreName)
          .put(value);

        request.onerror = () => {
          reject(request.error ?? new Error());
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      }),
  );
}

export function get<T extends ObjectStoreName>(
  objectStoreName: T,
  key: IDBValidKey,
): Promise<ObjectStoreEntryUnion<T>['value']> {
  return getConnection().then(
    (database) =>
      new Promise<ObjectStoreEntryUnion<T>['value']>((resolve, reject) => {
        const request = database
          .transaction(objectStoreName, 'readwrite')
          .objectStore(objectStoreName)
          .get(key) as IDBRequest<ObjectStoreEntryUnion<T>['value']>;

        request.onerror = () => {
          reject(request.error ?? new Error());
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      }),
  );
}

export function getAll<T extends ObjectStoreName>(
  objectStoreName: T,
): Promise<ObjectStoreEntryUnion<T>['value'][]> {
  return getConnection().then(
    (database) =>
      new Promise<ObjectStoreEntryUnion<T>['value'][]>((resolve, reject) => {
        const request = database
          .transaction(objectStoreName, 'readwrite')
          .objectStore(objectStoreName)
          .getAll() as IDBRequest<ObjectStoreEntryUnion<T>['value'][]>;

        request.onerror = () => {
          reject(request.error ?? new Error());
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      }),
  );
}

export function put<T extends ObjectStoreName>(
  objectStoreName: T,
  value: ObjectStoreEntryUnion<T>['value'],
): Promise<IDBValidKey> {
  return getConnection().then(
    (database) =>
      new Promise<IDBValidKey>((resolve, reject) => {
        const request = database
          .transaction(objectStoreName, 'readwrite')
          .objectStore(objectStoreName)
          .put(value);

        request.onerror = () => {
          reject(request.error ?? new Error());
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      }),
  );
}
