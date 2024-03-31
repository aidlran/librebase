import type { WrapValue } from '../../../../wrap';

export interface WrapResult extends Omit<WrapValue, 'hash' | 'mediaType'> {
  hash: Uint8Array;
}
