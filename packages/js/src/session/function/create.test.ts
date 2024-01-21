import { createSignal } from '@adamantjs/signals';
import { beforeEach, describe, expect, it, test } from 'vitest';
import type { PostToOneAction } from '../../worker/types/action.js';
import type { Request } from '../../worker/types/request.js';
import type { Result } from '../../worker/types/result.js';
import type { JobCallback } from '../../worker/worker-instance.js';
import type { AllSessions } from '../types.js';
import { construct } from './create.js';
import type { SessionLoadFn } from './load.js';

const postToOne = <T extends PostToOneAction>(request: Request<T>, callback?: JobCallback<T>) => {
  if (request.action !== 'session.create') {
    throw new Error('Unexpected request action');
  }
  if (callback) {
    callback({
      action: 'session.create',
      ok: true,
      payload: { id: 1, mnemonic: 'mnemonic sentence' },
    } as Result<T>);
  }
};
const load: SessionLoadFn = (id, _passphrase, callback) => {
  if (callback) callback({ id });
};
load.asPromise = (id, passphrase) => {
  return new Promise((resolve) => load(id, passphrase, resolve));
};
const allSessions = createSignal<AllSessions>({});
const fn = construct({ postToOne }, load, allSessions);

describe('create session', () => {
  it("doesn't use an unexpected request action", () => {
    expect(() => fn({ passphrase: 'passphrase' })).not.toThrow();
  });

  describe('add created session to all sessions observable', () => {
    const checkResult = () => {
      expect(allSessions()[1]).property('active').equals(false);
    };

    beforeEach(() => {
      allSessions.set({});
    });

    test('callback', () => {
      fn({ passphrase: 'passphrase' }, checkResult);
    });

    test('asPromise', () => {
      expect(fn.asPromise({ passphrase: 'passphrase' })).resolves;
      checkResult();
    });
  });
});
