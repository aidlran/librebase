import { Base58 } from '@astrobase/core/internal';

export type HashBytes = Uint8Array & { 0: HashAlgorithm };

export enum HashAlgorithm {
  SHA256 = 0,
}

export class Hash {
  constructor(
    /** The hash algorithm identifier byte of the hash. */
    readonly algorithm: HashAlgorithm,
    /** The hash bytes, minus the first algorithm identifier byte. */
    readonly value: Uint8Array,
  ) {}

  /**
   * Returns the full hash bytes, including the first algorithm identifier byte, as a new
   * `Uint8Array`.
   */
  toBytes(): HashBytes {
    return new Uint8Array([this.algorithm, ...this.value]) as HashBytes;
  }

  /** Returns the hash encoded into base58. */
  toBase58(): string {
    return Base58.encode(this.toBytes());
  }

  /** Returns the hash encoded into base58. */
  toString(): string {
    return this.toBase58();
  }
}

export async function hash(alg: HashAlgorithm, payload: BufferSource): Promise<Hash> {
  switch (alg) {
    case HashAlgorithm.SHA256:
      return new Hash(alg, new Uint8Array(await sha256(payload)));
    default:
      throw new TypeError('Unsupported algorithm');
  }
}

export function sha256(payload: BufferSource) {
  return crypto.subtle.digest('SHA-256', payload);
}
