import {
  instance,
  literal,
  never,
  number,
  object,
  optional,
  safeParse,
  startsWith,
  string,
  unknown,
} from 'valibot';

const wrapSchema = object(
  {
    $: string([startsWith('wrap:')]),
    _v: literal(1),
    hash: instance(Uint8Array),
    mediaType: string(),
    metadata: optional(unknown()),
    payload: instance(Uint8Array),
    type: number(),
  },
  never(),
);

export function isWrap(value: unknown): boolean {
  return safeParse(wrapSchema, value, { abortEarly: true }).success;
}
