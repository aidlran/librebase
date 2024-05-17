import type { HashAlgorithm } from '@librebase/fs';

export interface WrapRequest<TWrapName extends string = string, TMetadata = unknown> {
  wrapType: TWrapName;
  metadata: TMetadata;
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
  payload: Uint8Array;
}
