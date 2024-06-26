import { describe, expect, test } from 'vitest';
import { createDeferredDispatch, createDispatch, type DeferredDispatchTarget } from './dispatch.js';

describe('RPC Dispatch', () => {
  function randomString(len = 8) {
    return new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(len)));
  }

  const instanceID = randomString();
  const op = randomString();
  const payload = randomString();

  const target: DeferredDispatchTarget = {
    addEventListener() {},
    removeEventListener() {},
    postMessage(message) {
      expect(message.instanceID).toBe(instanceID);
      expect(message.jobID).toBeTypeOf('number');
      expect(message.op).toBe(op);
      expect(message.payload).toBe(payload);
    },
  };

  const dispatches = {
    'Basic Dispatch': createDispatch(target),
    'Deferred Dispatch': createDeferredDispatch(target),
  };

  describe('postMessage', () => {
    for (const [name, dispatch] of Object.entries(dispatches)) {
      test(name, () => {
        dispatch(op, payload, instanceID);
      });
    }
  });
});
