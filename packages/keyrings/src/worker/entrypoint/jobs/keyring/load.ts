import ecc from '@bitcoinerlab/secp256k1';
import { type BIP32API, BIP32Factory, type BIP32Interface } from 'bip32';
import { getRecord } from '../../../../indexeddb/indexeddb';
import type { PersistedKeyring } from '../../../../keyring/types';
import { entropyToMnemonic, mnemonicToSeed } from '../../../../mnemonic/bip39';
import type { LoadKeyringRequest, LoadKeyringResult } from '../../../types';

let bip32: BIP32API;

export async function loadKeyring<T>(
  request: LoadKeyringRequest,
): Promise<{ node: BIP32Interface; result: LoadKeyringResult<T> }> {
  if (!bip32) bip32 = BIP32Factory(ecc);

  const keyring = await getRecord<PersistedKeyring<T>>('lbkeyrings', 'keyring', request.id);

  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(request.passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 100000,
      salt: keyring.salt,
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );

  const decryptedPayload = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: keyring.nonce,
    },
    derivedKey,
    keyring.payload,
  );

  const mnemonic = await entropyToMnemonic(new Uint8Array(decryptedPayload));
  const seed = await mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(Buffer.from(seed));

  return {
    node,
    result: {
      id: keyring.id,
      metadata: keyring.metadata,
    },
  };
}
