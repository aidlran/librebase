import type { WrapValue } from '../../../../wrap/types';

export interface WrapResult extends Omit<WrapValue, 'hash' | 'mediaType'> {
  hash: Uint8Array;
}
