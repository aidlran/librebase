import {
  instance,
  literal,
  never,
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
