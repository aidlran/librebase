/**
 * @module JSON
 * @category API Reference
 */

import type { Codec } from '../immutable/codecs.js';
import { getMiddlewares, type CodecMiddleware } from '../middleware/index.js';

/** An JSON codec with extensible middleware system for the `application/json` media type. */
export const JSONCodec = {
  key: 'application/json',
  decode(payload, props) {
    const refTrack = new Set();
    const parsed = JSON.parse(new TextDecoder().decode(payload)) as unknown;
    return Promise.resolve(
      replace(getMiddlewares(props.instanceID), 'reviver', props.instanceID, refTrack, parsed),
    );
  },
  async encode(data, props) {
    const refTrack = new Set();
    const replaced = await replace(
      getMiddlewares(props.instanceID),
      'replacer',
      props.instanceID,
      refTrack,
      data,
    );
    return new TextEncoder().encode(JSON.stringify(replaced));
  },
} satisfies Codec;

async function replace(
  plugins: CodecMiddleware[],
  fn: keyof CodecMiddleware,
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
