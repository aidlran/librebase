import { textDecoder, textEncoder } from '../../shared';
import type { Codec } from '../types';
import type { JsonCodecPlugin, JsonCodecProps } from './types';

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

function decode(
  this: JsonCodecPlugin[],
  payload: Uint8Array,
  props: JsonCodecProps,
): Promise<unknown> {
  const refTrack = new Set();
  const parsed = JSON.parse(textDecoder.decode(payload)) as unknown;
  return Promise.resolve(replace(this, 'reviver', props.instanceID, refTrack, parsed));
}

async function encode(
  this: JsonCodecPlugin[],
  data: unknown,
  props: JsonCodecProps,
): Promise<Uint8Array> {
  const refTrack = new Set();
  const replaced = await replace(this, 'replacer', props.instanceID, refTrack, data);
  return textEncoder.encode(JSON.stringify(replaced));
}

async function replace(
  plugins: JsonCodecPlugin[],
  fn: keyof JsonCodecPlugin,
  instanceID: string | undefined,
  refTrack: Set<unknown>,
  value: unknown,
  key?: string | number,
): Promise<unknown> {
  if (refTrack.has(value)) {
    throw new Error('Circular reference');
  }
  refTrack.add(value);
  if (value instanceof Array) {
    const replaced = await Promise.all(
      value.map((entry, index) => replace(plugins, fn, instanceID, refTrack, entry, index)),
    );
    refTrack.delete(value);
    return replaced;
  }
  if (value !== null && typeof value === 'object') {
    const replaceObj: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      replaceObj[key] = await replace(
        plugins,
        fn,
        instanceID,
        refTrack,
        (value as Record<string, unknown>)[key],
        key,
      );
    }
    refTrack.delete(value);
    return replaceObj;
  }
  for (const plugin of plugins) {
    const func = plugin[fn];
    if (func) {
      const result = await Promise.resolve(func(key, value, { instanceID }));
      if (result !== value) {
        refTrack.delete(value);
        return result;
      }
    }
  }
  refTrack.delete(value);
  return value;
}
