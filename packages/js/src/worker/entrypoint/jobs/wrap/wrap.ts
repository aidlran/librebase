import { sign } from '@noble/secp256k1';
import { base58, base64 } from '../../../../buffer';
import { HashAlgorithm, hash } from '../../../../hash';
import type { WrapType } from '../../../../wrap';
import type { WrapRequest, WrapResult } from '../../../types';
import { findPrivateKey } from '../../job-worker';

export async function wrap<T extends WrapType = WrapType>(
  request: WrapRequest<T>,
): Promise<WrapResult<T>> {
  const hashAlg = request.hashAlg ?? HashAlgorithm.SHA256;
  const payloadHash = await hash(hashAlg, request.payload);
  if (request.wrapType === 'ecdsa') {
    const publicKey = (request as WrapRequest<'ecdsa'>).metadata;
    const pubKeyBin = typeof publicKey === 'string' ? base58.decode(publicKey) : publicKey;
    const privateKey = await findPrivateKey(pubKeyBin);
    const signature = await sign(payloadHash.value, privateKey);
    return base64.encode(signature) as WrapResult<T>;
  } else if (request.wrapType === 'encrypt') {
    const config = (request as WrapRequest<'encrypt'>).metadata;
    const publicKey = config.pubKey;
    const pubKeyBin = typeof publicKey === 'string' ? base58.decode(publicKey) : publicKey;
    const privateKey = await findPrivateKey(pubKeyBin);
    const encryptionHashAlg = config.hashAlg ?? 'SHA-256';
    const iterations = config.iterations ?? 600000;
    const iv = config.iv ?? crypto.getRandomValues(new Uint8Array(12));
    const kdf = config.kdf ?? 'PBKDF2';
    const salt = config.salt ?? crypto.getRandomValues(new Uint8Array(16));
    const sourceKey = await crypto.subtle.importKey('raw', privateKey, kdf, false, ['deriveKey']);
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: kdf,
        hash: encryptionHashAlg,
        salt,
        iterations,
      },
      sourceKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt'],
    );
    const payload = new Uint8Array(
      await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        derivedKey,
        request.payload,
      ),
    );
    return {
      meta: {
        hashAlg: encryptionHashAlg,
        iterations,
        iv,
        kdf,
        pubKey: pubKeyBin,
        salt,
      },
      payload,
    } as WrapResult<T>;
  } else {
    throw new TypeError('Unsupported wrap type');
  }
}
