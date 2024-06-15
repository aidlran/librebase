import { unwrap, wrap } from '@librebase/wraps';
import { getRecord, putRecord } from '../../shared/indexeddb.js';
import type * as P from '../../shared/message-payloads.js';
import { entropyToMnemonic, mnemonicToEntropy, mnemonicToSeed } from '../mnemonic/bip39.js';
import type { EncryptWrapValue } from '../wrap/encrypt.js';

export interface PersistedKeyring<T = unknown> {
  id: number;
  metadata?: T;
  payload: EncryptWrapValue;
}

export const activeSeeds: Record<string, Uint8Array> = {};

export function clearKeyring(instanceID = '') {
  activeSeeds[instanceID]?.fill(0);
  delete activeSeeds[instanceID];
}

export async function createKeyring(
  request: P.CreateKeyringRequest,
  instanceID?: string,
): Promise<P.CreateKeyringResult> {
  if (!request.passphrase) {
    throw new TypeError('No passphrase provided');
  }
  const entropy = crypto.getRandomValues(new Uint8Array(16));
  const mnemonic = (await entropyToMnemonic(entropy, request.wordlist)).join(' ');
  const id = await saveKeyring(
    entropy,
    request.passphrase,
    request.metadata,
    undefined,
    instanceID,
  );
  return { mnemonic, id };
}

export async function importKeyring(
  request: P.ImportKeyringRequest,
  instanceID?: string,
): Promise<P.ImportKeyringResult> {
  if (!request.passphrase) {
    throw new TypeError('No passphrase provided');
  }
  const entropy = await mnemonicToEntropy(request.mnemonic.split(' '), request.wordlist);
  const id = await saveKeyring(
    entropy,
    request.passphrase,
    request.metadata,
    undefined,
    instanceID,
  );
  return { id };
}

export async function loadKeyring<T>(
  request: P.LoadKeyringRequest,
  instanceID?: string,
): Promise<P.LoadKeyringResult<T>> {
  const keyring = await getRecord<PersistedKeyring<T>>('lbkeyrings', 'keyring', request.id);
  const entropy = (await unwrap(keyring.payload, instanceID)).value as Uint8Array;
  const mnemonic = await entropyToMnemonic(entropy, request.wordlist);
  const seed = await mnemonicToSeed(mnemonic.join(' '));
  activeSeeds[instanceID ?? ''] = new Uint8Array(seed);
  return {
    id: keyring.id,
    metadata: keyring.metadata,
  };
}

export async function saveKeyring(
  entropy: Uint8Array,
  passphrase: string,
  metadata: unknown,
  id?: number,
  instanceID?: string,
): Promise<number> {
  const payload = (await wrap(
    {
      mediaType: 'application/octet-stream',
      metadata: { passphrase },
      type: 'encrypt',
      value: entropy,
    },
    instanceID,
  )) as EncryptWrapValue;
  const persistKeyring: Partial<PersistedKeyring> = {
    payload,
    metadata,
  };
  if (id) {
    persistKeyring.id = id;
  }
  return putRecord('lbkeyrings', 'keyring', persistKeyring);
}
