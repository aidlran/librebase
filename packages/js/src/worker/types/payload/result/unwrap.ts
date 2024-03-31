import type { WrapConfig } from '../../../../wrap';

export interface UnwrapResult {
  config: WrapConfig;
  payload: Uint8Array;
}
