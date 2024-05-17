import type { WrapValueMetadataMap } from '@librebase/wraps';

export interface WrapResultMap {
  /** Base 64 encoded signature. */
  ecdsa: string;
  encrypt: {
    metadata: WrapValueMetadataMap['encrypt'];
    payload: Uint8Array;
  };
}

export type WrapResult<T extends keyof WrapResultMap = keyof WrapResultMap> = WrapResultMap[T];
