import { sha256 } from '.';
import { HashAlgorithm } from './algorithm';

export * from './algorithm';
export * from './sha256';

export function hash(alg: HashAlgorithm, payload: string | ArrayBuffer) {
  switch (alg) {
    case HashAlgorithm.SHA256:
      return sha256(payload);
    default:
      throw new TypeError('Unsupported algorithm');
  }
}
