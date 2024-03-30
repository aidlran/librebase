import { literal, object, safeParse, string, type Input } from 'valibot';
import { base64 } from '../../../crypto/encode/base';
import type { JsonCodecPlugin } from '../types';

const schema = object({
  $: literal('bytes:b64'),
  v: string(),
});

type Schema = Input<typeof schema>;

/** JSON codec plugin for storing byte arrays as base64 strings. */
export const binaryPlugin: JsonCodecPlugin = {
  replacer(_, value) {
    if (value instanceof Uint8Array) {
      return {
        $: 'bytes:b64',
        v: base64.encode(value),
      };
    }
    return value;
  },
  reviver(_, value) {
    if (safeParse(schema, value, { abortEarly: true }).success) {
      return base64.decode((value as Schema).v);
    }
    return value;
  },
};
