import { expect, test } from 'vitest';
import { host, setHost } from './host.js';

test('Set RPC Host', () => {
  const newHost = {};
  expect(host).not.toBe(newHost);
  setHost(newHost as never);
  expect(host).toBe(newHost);
});
