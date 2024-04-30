import { expect, test } from 'vitest';
import { encodeWirePayload, parseWirePayload } from './payload';

test('Wire payload serialization', () => {
  for (const {
    encoded,
    decoded: { type, payload },
  } of [
    {
      encoded: [1, 2, 3, 4],
      decoded: { type: 1, payload: [2, 3, 4] },
    },
    {
      encoded: [232, 7, 2, 3, 4],
      decoded: { type: 1000, payload: [2, 3, 4] },
    },
  ]) {
    expect(encodeWirePayload(type, payload)).toEqual(new Uint8Array(encoded));
    expect(parseWirePayload(encoded)).toEqual([type, new Uint8Array(payload)]);
  }
});
