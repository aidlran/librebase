import { object, string, type Input, safeParse } from 'valibot';
import { base58 } from '../../../crypto/encode/base';
import { Hash } from '../../../hash';
import type { JsonCodecPlugin } from '../types';

const schema = object({ '#': string() });

type Schema = Input<typeof schema>;

/** JSON codec plugin for storing Hash instances as base58 strings. */
export const hashPlugin: JsonCodecPlugin = {
  replacer(_, value) {
    return value instanceof Hash ? { '#': value.toBase58() } : value;
  },
  reviver(_, value) {
    if (safeParse(schema, value, { abortEarly: true }).success) {
      const hash = base58.decode((value as Schema)['#']);
      return new Hash(hash[0], hash.subarray(1));
    }
    return value;
  },
};
