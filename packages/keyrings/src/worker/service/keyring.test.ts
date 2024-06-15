import { CodecRegistry } from '@librebase/fs';
import { WrapRegistry } from '@librebase/wraps';
import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, expectTypeOf, it, test } from 'vitest';
import wordlist from '../../../bip39-wordlist-english.json';
import { openKeyringDB } from '../../shared/init-db.js';
import { english } from '../mnemonic/test/vectors.json';
import { EncryptWrapSchema } from '../wrap/encrypt.js';
import { activeSeeds, clearKeyring, createKeyring, importKeyring, loadKeyring } from './keyring.js';

describe('Keyring API', () => {
  const instanceID = 'Keyring API';

  beforeAll(async () => {
    CodecRegistry.register(
      {
        key: 'application/octet-stream',
        decode: (v) => v,
        encode: (v) => v as Uint8Array,
      },
      { instanceID },
    );
    WrapRegistry.register(EncryptWrapSchema, { instanceID });
    await openKeyringDB();
  });

  test('Clear keyring', () => {
    const instanceID = 'Clear keyring';
    const length = 16;
    const seed = crypto.getRandomValues(new Uint8Array(length));
    activeSeeds[instanceID] = seed;
    clearKeyring(instanceID);
    // Bytes should be shredded
    expect(seed).toEqual(new Uint8Array(Array.from({ length }, () => 0)));
    // Active seed should have been cleared
    expect(activeSeeds[instanceID]).toBeUndefined();
  });

  describe('Create keyring', () => {
    it('returns a valid result', () => {
      const job = createKeyring({ passphrase: 'test', wordlist }, instanceID);
      expectTypeOf(job).resolves.toHaveProperty('mnemonic').toBeString();
      expectTypeOf(job).resolves.toHaveProperty('id').toBeNumber();
    });

    it('throws if no options object given', () => {
      const job = createKeyring(undefined as never, instanceID);
      void expect(job).rejects.toThrow(TypeError);
    });

    it('disallows blank passphrases', () => {
      const job = createKeyring({} as never, instanceID);
      void expect(job).rejects.toThrow(TypeError);
    });
  });

  describe('Import keyring', () => {
    test('imports valid mnemonic and load', async () => {
      const passphrase = new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(8)));
      let lastSeed = activeSeeds[instanceID];
      for (const [, mnemonic] of english) {
        const { id } = await importKeyring({ mnemonic, passphrase, wordlist }, instanceID);
        expectTypeOf(id).toBeNumber();
        await loadKeyring({ id, passphrase, wordlist }, instanceID);
        expect(activeSeeds[instanceID]).not.toEqual(lastSeed);
        lastSeed = activeSeeds[instanceID];
      }
    });

    it('throws if no options object given', () => {
      const job = importKeyring(undefined as never, instanceID);
      void expect(job).rejects.toThrow(TypeError);
    });

    it('disallows blank passphrases', () => {
      const job = importKeyring({} as never, instanceID);
      void expect(job).rejects.toThrow(TypeError);
    });
  });
});
