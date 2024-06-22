import { expect, test } from 'vitest';
import { client, setHost } from './client.js';

test('Set RPC Host', () => {
  const newHost = {};
  expect(client).not.toBe(newHost);
  setHost(newHost as never);
  expect(client).toBe(newHost);
});
