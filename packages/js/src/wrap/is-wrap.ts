import { instance, number, object, optional, string, unknown, safeParse } from 'valibot';
import { Hash } from '../hash';

const wrapSchema = object({
  hash: instance(Hash),
  mediaType: string(),
  metadata: optional(unknown()),
  payload: instance(Uint8Array),
  type: number(),
});

export function isWrap(value: unknown): boolean {
  return safeParse(wrapSchema, value, { abortEarly: true }).success;
}
