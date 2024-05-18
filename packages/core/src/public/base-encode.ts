import base from 'base-x';
import { bytesToString, stringToBytes } from './buffer-utils';

export interface BaseEncoder {
  decode(encoded: string): Uint8Array;
  encode(input: Uint8Array): string;
}

export const Base58: BaseEncoder = base(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
);

export const Base64: BaseEncoder = {
  decode: (encoded: string) => stringToBytes(atob(encoded)),
  encode: (input: Uint8Array) => btoa(bytesToString(input)),
};
