import { textDecoder, textEncoder } from '../../shared';
import type { Codec, CodecProps } from '../types';
import type { JsonCodecPlugin } from './types';

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

function decode(this: JsonCodecPlugin[], payload: Uint8Array, props: CodecProps): unknown {
  return JSON.parse(textDecoder.decode(payload), (key, value) => {
    for (const { reviver } of this) {
      if (reviver) {
        const result = reviver(key, value, { instanceID: props.instanceID });
        if (result !== value) return result;
      }
    }
    return value as unknown;
  }) as unknown;
}

function encode(this: JsonCodecPlugin[], data: unknown, props: CodecProps): Uint8Array {
  return textEncoder.encode(
    JSON.stringify(data, (key, value) => {
      for (const { replacer } of this) {
        if (replacer) {
          const result = replacer(key, value, { instanceID: props.instanceID });
          if (result !== value) return result;
        }
      }
      return value as unknown;
    }),
  );
}
