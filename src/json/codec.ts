/**
 * @module JSON
 * @category API
 */

import type { Codec, CodecProps } from '../immutable/codecs.js';
import type { JsonCodecMiddleware } from '../middleware/types.js';

/** An extensible JSON codec for the `application/json` media type. */
export interface JSONCodec extends Codec {
  key: 'application/json';
  decode<T>(payload: Uint8Array, props: CodecProps): Promise<T>;
  encode(data: unknown, props: CodecProps): Promise<Uint8Array>;
}

/**
 * Creates a {@linkcode JSONCodec}.
 *
 * @param middlewares Middlewares can be registered here at creation time.
 * @returns The {@linkcode JSONCodec} instance.
 */
export function json(...middlewares: JsonCodecMiddleware[]): JSONCodec {
  return {
    key: 'application/json',
    decode: decode.bind(middlewares) as JSONCodec['decode'],
    encode: encode.bind(middlewares),
  };
}

function decode(
  this: JsonCodecMiddleware[],
  payload: Uint8Array,
  props: CodecProps,
): Promise<unknown> {
  const refTrack = new Set();
  const parsed = JSON.parse(new TextDecoder().decode(payload)) as unknown;
  return Promise.resolve(replace(this, 'reviver', props.instanceID, refTrack, parsed));
}

async function encode(
  this: JsonCodecMiddleware[],
  data: unknown,
  props: CodecProps,
): Promise<Uint8Array> {
  const refTrack = new Set();
  const replaced = await replace(this, 'replacer', props.instanceID, refTrack, data);
  return new TextEncoder().encode(JSON.stringify(replaced));
}

async function replace(
  plugins: JsonCodecMiddleware[],
  fn: keyof JsonCodecMiddleware,
  instanceID: string | undefined,
  refTrack: Set<unknown>,
  value: unknown,
  key?: string | number,
): Promise<unknown> {
  if (refTrack.has(value)) {
    throw new Error('Circular reference');
  }
  for (const plugin of plugins) {
    const func = plugin[fn];
    if (func) {
      value = await Promise.resolve(func(key, value, { instanceID }));
    }
  }
  if (value instanceof Array) {
    refTrack.add(value);
    value = await Promise.all(
      value.map((entry, index) => replace(plugins, fn, instanceID, refTrack, entry, index)),
    );
  } else if (value !== null && typeof value === 'object') {
    refTrack.add(value);
    for (const key of Object.keys(value)) {
      (value as Record<string, unknown>)[key] = await replace(
        plugins,
        fn,
        instanceID,
        refTrack,
        (value as Record<string, unknown>)[key],
        key,
      );
    }
  }
  refTrack.delete(value);
  return value;
}
