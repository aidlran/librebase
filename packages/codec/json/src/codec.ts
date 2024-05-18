import type { Codec, CodecProps } from '@librebase/fs';
import type { JsonCodecMiddleware } from './types';

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

/** Extensible JSON codec for the `application/json` media type. */
export function json(...middlewares: JsonCodecMiddleware[]) {
  return {
    key: 'application/json',
    decode: decode.bind(middlewares) as <T>(payload: Uint8Array, props: CodecProps) => Promise<T>,
    encode: encode.bind(middlewares) as (data: unknown, props: CodecProps) => Promise<Uint8Array>,
  } satisfies Codec;
}

function decode(
  this: JsonCodecMiddleware[],
  payload: Uint8Array,
  props: CodecProps,
): Promise<unknown> {
  const refTrack = new Set();
  const parsed = JSON.parse(textDecoder.decode(payload)) as unknown;
  return Promise.resolve(replace(this, 'reviver', props.instanceID, refTrack, parsed));
}

async function encode(
  this: JsonCodecMiddleware[],
  data: unknown,
  props: CodecProps,
): Promise<Uint8Array> {
  const refTrack = new Set();
  const replaced = await replace(this, 'replacer', props.instanceID, refTrack, data);
  return textEncoder.encode(JSON.stringify(replaced));
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
