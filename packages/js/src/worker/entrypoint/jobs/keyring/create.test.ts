import { expect, expectTypeOf, it } from 'vitest';
import { createKeyring } from './create';

const createKeyringWithMock = (() => {
  const saveMock = () => Promise.resolve(0);
  return (options: any) => createKeyring(saveMock, options);
})();

it('returns a valid result', () => {
  const job = createKeyringWithMock({ passphrase: 'test' });
  expectTypeOf(job).resolves.toHaveProperty('mnemonic').toBeString();
});

it('throws if no options object given', () => {
  const job = createKeyringWithMock(undefined);
  void expect(job).rejects.toThrow(TypeError);
});

it('disallows blank passphrases', () => {
  const job = createKeyringWithMock({});
  void expect(job).rejects.toThrow(TypeError);
});
