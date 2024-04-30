import type { JsonCodecMiddleware } from '@librebase/codec-json';
import {
  instance,
  integer,
  literal,
  never,
  number,
  object,
  optional,
  safeParse,
  startsWith,
  string,
  union,
  unknown,
} from 'valibot';
import { unwrap, wrap, type WrapConfig, type WrapValue } from './wraps';

const configSchema = object(
  {
    hashAlg: optional(number([integer()])),
    mediaType: union([string(), object({ type: string() })]),
    metadata: optional(unknown()),
    type: string(),
    value: unknown(),
  },
  never(),
);

const wrapSchema = object(
  {
    $: string([startsWith('wrap:')]),
    h: string(),
    m: optional(unknown()),
    p: instance(Uint8Array),
    v: literal(1),
  },
  never(),
);

export function isWrap(value: unknown): boolean {
  return safeParse(wrapSchema, value, { abortEarly: true }).success;
}

export function isWrapConfig(value: unknown): boolean {
  return safeParse(configSchema, value, { abortEarly: true }).success;
}

export const WrapMiddleware: JsonCodecMiddleware = {
  replacer(_, value, props) {
    return isWrapConfig(value) ? wrap(value as WrapConfig, props.instanceID) : value;
  },
  reviver(_, value, props) {
    return isWrap(value) ? unwrap(value as WrapValue, props.instanceID) : value;
  },
};