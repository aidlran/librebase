import type { WrapConfigMetadataMap } from '@librebase/wraps';

export interface UnwrapResultMap {
  ecdsa: boolean;
  encrypt: {
    metadata: WrapConfigMetadataMap['encrypt'];
    payload: Uint8Array;
  };
}

export type UnwrapResult<T extends keyof UnwrapResultMap = keyof UnwrapResultMap> =
  UnwrapResultMap[T];
