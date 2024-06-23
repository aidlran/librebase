import { expect, test } from 'vitest';
import { client, setClient } from './client.js';

test('Set RPC Host', () => {
  const newHost = {};
  expect(client).not.toBe(newHost);
  setClient(newHost as never);
  expect(client).toBe(newHost);
});
