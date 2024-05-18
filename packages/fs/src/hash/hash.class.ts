import { Base58 } from '@librebase/core';
import type { HashAlgorithm } from './algorithm.enum';

export type HashBytes = Uint8Array & { 0: HashAlgorithm };

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
