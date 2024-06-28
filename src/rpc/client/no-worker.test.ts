import { describe, expect, test } from 'vitest';
import { Handlers } from '../server/server.js';
import { NoWorker } from './no-worker.js';

const randomBytes = () => crypto.getRandomValues(new Uint8Array(8));
const randomText = () => new TextDecoder().decode(randomBytes());

describe('NoWorker RPC client', () => {
  const inputRequest = randomBytes();
  const inputInstanceID = randomText();

  test('Success response', async () => {
    const op = randomText();
    const response = randomBytes();

    Handlers.set(op, (request, instanceID) => {
      expect(request).toBe(inputRequest);
      expect(instanceID).toBe(inputInstanceID);
      return response;
    });

    await Promise.all([
      expect(NoWorker.postToAll(op, inputRequest, inputInstanceID)).resolves.toEqual([response]),
      expect(NoWorker.postToOne(op, inputRequest, inputInstanceID)).resolves.toBe(response),
    ]);

    Handlers.delete(op);
  });

  test('Error response', async () => {
    const op = randomText();
    const errorMessage = randomText();

    Handlers.set(op, (request, instanceID) => {
      expect(request).toBe(inputRequest);
      expect(instanceID).toBe(inputInstanceID);
      throw new Error(errorMessage);
    });

    await Promise.all([
      expect(NoWorker.postToAll(op, inputRequest, inputInstanceID)).rejects.toThrow(errorMessage),
      expect(NoWorker.postToOne(op, inputRequest, inputInstanceID)).rejects.toThrow(errorMessage),
    ]);

    Handlers.delete(op);
  });
});
