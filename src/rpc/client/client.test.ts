import { expect, test } from 'vitest';
import { client, setClient } from './client.js';

test('Set RPC client', () => {
  const newClient = {};
  expect(client).not.toBe(newClient);
  setClient(newClient as never);
  expect(client).toBe(newClient);
});
