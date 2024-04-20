import { base64 } from '../../../buffer';

/** JSON codec plugin for storing arbitrary byte arrays as base64 strings. */
export const binaryPlugin = {
  replacer(_: unknown, value: unknown) {
    let v: string;
    if (value instanceof Uint8Array) {
      v = base64.encode(value);
    } else if (value instanceof ArrayBuffer) {
      v = base64.encode(new Uint8Array(value));
    } else {
      return value;
    }
    return `$bin:b64:${v}`;
  },
  reviver(_: unknown, value: unknown) {
    if (typeof value === 'string' && value.startsWith('$bin:b64:')) {
      return base64.decode(value.slice(9));
    }
    return value;
  },
};
