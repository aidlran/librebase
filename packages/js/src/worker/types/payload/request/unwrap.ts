import type { WrapValue } from '../../../../wrap/types';

export type UnwrapRequest = Omit<WrapValue, 'hash'> & {
  hash: Uint8Array;
};
