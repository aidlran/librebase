import { putRecord } from '../../../../indexeddb/indexeddb';
import type { PersistedKeyring } from '../../../../keyring/types';

export async function saveKeyring(
  payload: Uint8Array,
  passphrase: string,
  metadata: unknown,
  id?: number,
): Promise<number> {
  // TODO: move crypto functions to crypto module
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 100000,
      salt,
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );

  const encryptedPayload = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    derivedKey,
    payload,
  );

  const keyring: Partial<PersistedKeyring> = {
    salt,
    nonce,
    payload: encryptedPayload,
    metadata,
  };

  if (id) keyring.id = id;

  return putRecord('lbkeyrings', 'keyring', keyring);
}
