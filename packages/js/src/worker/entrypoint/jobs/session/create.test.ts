import { expect, expectTypeOf, it } from 'vitest';
import { createSession } from './create.js';

const createSessionWithMock = (() => {
  const saveMock = () => Promise.resolve(0);
  return (options: any) => createSession(saveMock, options);
})();

it('returns a valid result', () => {
  const job = createSessionWithMock({ passphrase: 'test' });
  expectTypeOf(job).resolves.toHaveProperty('mnemonic').toBeString();
});

it('throws if no options object given', () => {
  const job = createSessionWithMock(undefined);
  void expect(job).rejects.toThrow(TypeError);
});

it('disallows blank passphrases', () => {
  const job = createSessionWithMock({});
  void expect(job).rejects.toThrow(TypeError);
});
