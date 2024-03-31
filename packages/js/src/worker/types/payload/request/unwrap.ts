import type { WrapValue } from '../../../../wrap/types';

export interface UnwrapRequest extends Omit<WrapValue, 'hash'> {
  hash: Uint8Array;
}
