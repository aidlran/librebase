import ecc from '@bitcoinerlab/secp256k1';
import { type BIP32API, BIP32Factory, type BIP32Interface } from 'bip32';
import { entropyToMnemonic, mnemonicToSeed } from '../../../crypto/mnemonic/bip39.js';
import { get, type Session } from '../../../indexeddb/indexeddb.js';
import type { LoadSessionRequest, LoadSessionResult } from '../../interface/payload/index.js';

let bip32: BIP32API;

export const load = async <T>(
  request: LoadSessionRequest,
): Promise<{ node: BIP32Interface; result: LoadSessionResult<T> }> => {
  bip32 ??= BIP32Factory(ecc);

  const session = (await get('session', request.id)) as Session<T>;

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
      salt: session.salt,
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );

  const decryptedPayload = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: session.nonce,
    },
    derivedKey,
    session.payload,
  );

  const mnemonic = await entropyToMnemonic(new Uint8Array(decryptedPayload));
  const seed = await mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(Buffer.from(seed));

  return {
    node,
    result: {
      id: session.id as number,
      metadata: session.metadata,
    },
  };
};
