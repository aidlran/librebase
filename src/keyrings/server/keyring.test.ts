import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it, test } from 'vitest';
import wordlist from '../../../bip39-wordlist-english.json';
import { getChannels } from '../../core/channels.js';
import { Hash } from '../../immutable/hashes.js';
import { indexeddb } from '../../indexeddb/indexeddb.js';
import { KEYRINGS_INSTANCE_ID, KEYRINGS_INSTANCE_ID as instanceID } from '../shared/constants.js';
import './init-instance.js';
import { activeSeeds, clearKeyring, createKeyring, importKeyring } from './keyring.js';
import { english } from './mnemonic/test/vectors.json';

describe('Keyring Procedures', () => {
  beforeAll(async () => {
    /** @todo(test): need an in-memory driver, or something. */
    await indexeddb().then((c) => getChannels(KEYRINGS_INSTANCE_ID).push(c));
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
    test('Create a keyring and load', async () => {
      const passphrase = new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(8)));
      const metadata = new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(8)));
      const job = await createKeyring({ metadata, passphrase, wordlist }, instanceID);
      expect(job.id).toBeInstanceOf(Hash);
      expect(job.mnemonic).toBeTypeOf('string');

      /** @todo(fix) */
      // const resultMetadata = await loadKeyring({ id: job.id, passphrase, wordlist }, instanceID);
      // expect(resultMetadata).toBe(metadata);
      // expect(activeSeeds[instanceID]).toBeDefined();
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
      const metadata = new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(8)));
      // let lastSeed = activeSeeds[instanceID];
      for (const [, mnemonic] of english) {
        const id = await importKeyring({ metadata, mnemonic, passphrase, wordlist }, instanceID);
        expect(id).toBeInstanceOf(Hash);

        /** @todo(fix) */
        // const resultMetadata = await loadKeyring({ id, passphrase, wordlist }, instanceID);
        // expect(resultMetadata).toBe(metadata);
        // expect(activeSeeds[instanceID]).not.toEqual(lastSeed);
        // lastSeed = activeSeeds[instanceID];
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
