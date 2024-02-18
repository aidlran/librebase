import { type HashAlgorithm, hash } from '../crypto/hash';

export function dataHash(alg: HashAlgorithm, payload: string | ArrayBuffer) {
  return hash(alg, payload).then((hash) => new Uint8Array([alg, ...new Uint8Array(hash)]));
}
