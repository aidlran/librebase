import base from 'base-x';
import { bytesToString, stringToBytes } from '../common/buffer-utils';

export const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

export const base64 = {
  decode(encoded: string): Uint8Array {
    return stringToBytes(atob(encoded));
  },
  encode(input: Uint8Array): string {
    return btoa(bytesToString(input));
  },
};

export const base64Url = {
  decode(encoded: string): string {
    return atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  },
  encode(input: string): string {
    return btoa(input.replace(/-/g, '+').replace(/_/g, '/'));
  },
};
