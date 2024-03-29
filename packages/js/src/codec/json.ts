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
