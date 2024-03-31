import type { WrapConfig } from '../../../../wrap';

export type WrapRequest = WrapConfig & {
  payload: Uint8Array;
};
