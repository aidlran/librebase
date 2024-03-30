import { HashAlgorithm } from './algorithm.enum';
import { Hash } from './hash.class';
import { sha256 } from './sha256';

// TODO: make it possible to register additional algorithms

export async function hash(alg: HashAlgorithm, payload: BufferSource): Promise<Hash> {
  switch (alg) {
    case HashAlgorithm.SHA256:
      return new Hash(alg, new Uint8Array(await sha256(payload)));
    default:
      throw new TypeError('Unsupported algorithm');
  }
}
