import { Hash } from '../hash';
import type { WrapValue } from './types';

export function isWrap(value: unknown): boolean {
  if (value !== null && typeof value === 'object') {
    const keyCount = Object.keys(value).length;
    const wrap = value as WrapValue;
    if (
      (keyCount == 4 || keyCount == 5) &&
      wrap.hash instanceof Hash &&
      typeof wrap.mediaType === 'string' &&
      wrap.payload instanceof Uint8Array &&
      typeof wrap.type === 'number'
    ) {
      return true;
    }
  }
  return false;
}
