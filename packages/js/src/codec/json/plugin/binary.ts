import { base64 } from '../../../crypto/encode/base';
import type { JsonCodecPlugin } from '../types';

/** JSON codec plugin for storing byte arrays as base64 strings. */
export const binaryPlugin: JsonCodecPlugin = {
  replacer(_, value) {
    return value instanceof Uint8Array
      ? {
          $: 'bytes:b64',
          v: base64.encode(value),
        }
      : value;
  },
  reviver(_, v) {
    const value = v as { $: string; v: string };
    if (
      value !== null &&
      typeof value === 'object' &&
      Object.keys(value).length == 2 &&
      value.$ === 'bytes:b64' &&
      typeof value.v === 'string'
    ) {
      return base64.decode(value.v);
    }
    return value;
  },
};
