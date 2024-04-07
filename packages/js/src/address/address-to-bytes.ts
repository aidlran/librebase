import { base58 } from '../buffer';

export function addressToBytes(address: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (typeof address === 'string') {
    return base58.decode(address);
  } else if (address instanceof Uint8Array) {
    return address;
  } else {
    return new Uint8Array(address);
  }
}
