import type { WrapConfig } from '../../../../wrap';

export interface WrapRequest extends WrapConfig {
  payload: Uint8Array;
}
