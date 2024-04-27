export interface Keyring<T = unknown> {
  id: number;
  metadata?: T;
}

export interface PersistedKeyring<T = unknown> extends Keyring<T> {
  nonce: ArrayBuffer;
  salt: ArrayBuffer;
  payload: ArrayBuffer;
}
