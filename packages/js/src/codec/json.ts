import { base58, base64 } from '../crypto/encode/base';
import { Hash } from '../hash/hash.class';
import { textDecoder, textEncoder } from '../shared';
import type { Codec } from './types';

// TODO: plugin that encodes byte arrays as base64
// TODO: plugin that encodes hashes as base58

/** A plugin interface providing functions to hook into the native `JSON` API. */
interface JsonCodecPlugin {
  /**
   * A function that alters the output of the stringifier. See
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer
   */
  replacer?: (key: string, value: unknown) => unknown;
  /**
   * A function that alters the output of the parser. See
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver
   */
  reviver?: (key: string, value: unknown) => unknown;
}

/**
 * Extensible JSON codec for the `application/json` media type and structured data values. Node
 * values are first encoded as JSON strings using the native `JSON` API before being converted to
 * bytes. Plugins can provide replacer and reviver functions that hook into the native `JSON` API.
 */
export function jsonCodec(...plugins: JsonCodecPlugin[]): Codec {
  return {
    decode: decode.bind(plugins),
    encode: encode.bind(plugins),
  };
}

function decode(this: JsonCodecPlugin[], payload: Uint8Array): unknown {
  return JSON.parse(textDecoder.decode(payload), (key, value) => {
    for (const { reviver } of this) {
      if (reviver) {
        const result = reviver(key, value);
        if (result !== value) return result;
      }
    }
    return value as unknown;
  }) as unknown;
}

function encode(this: JsonCodecPlugin[], data: unknown): Uint8Array {
  return textEncoder.encode(
    JSON.stringify(data, (key, value) => {
      for (const { replacer } of this) {
        if (replacer) {
          const result = replacer(key, value);
          if (result !== value) return result;
        }
      }
      return value as unknown;
    }),
  );
}

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

/** JSON codec plugin for storing Hash instances as base58 strings. */
export const hashPlugin: JsonCodecPlugin = {
  replacer(_, value) {
    return value instanceof Hash ? { '#': value.toBase58() } : value;
  },
  reviver(_, v) {
    const value = v as { '#': string };
    if (
      value !== null &&
      typeof value === 'object' &&
      Object.keys(value).length == 1 &&
      typeof value['#'] === 'string'
    ) {
      const hash = base58.decode(value['#']);
      return new Hash(hash[0], hash.subarray(1));
    }
    return value;
  },
};
