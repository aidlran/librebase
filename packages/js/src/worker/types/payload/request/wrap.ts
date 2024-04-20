import type { HashAlgorithm } from '../../../../hash';
import type { WrapConfigMetadataMap, WrapType } from '../../../../wrap';

export interface WrapRequest<T extends WrapType = WrapType> {
  wrapType: T;
  metadata: WrapConfigMetadataMap[T];
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
  payload: Uint8Array;
}
