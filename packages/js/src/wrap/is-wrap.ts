import { instance, number, object, optional, string, unknown, safeParse } from 'valibot';

const wrapSchema = object({
  hash: instance(Uint8Array),
  mediaType: string(),
  metadata: optional(unknown()),
  payload: instance(Uint8Array),
  type: number(),
});

export function isWrap(value: unknown): boolean {
  return safeParse(wrapSchema, value, { abortEarly: true }).success;
}
