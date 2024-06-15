import { describe, expect, test } from 'vitest';
import WORDLIST from '../../../bip39-wordlist-english.json';
import { entropyToMnemonic, mnemonicToEntropy, mnemonicToSeed } from './bip39.js';
import { english } from './test/vectors.json';

function hex2Bytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

english.forEach(([entropyHex, mnemonic, seedHex], i) => {
  describe(`Vector ${i + 1} (${mnemonic.slice(0, 30).trim()}...)`, () => {
    const entropy = hex2Bytes(entropyHex);
    const words = mnemonic.split(' ');

    test('entropyToMnemonic', async () => {
      expect(await entropyToMnemonic(entropy, WORDLIST)).toEqual(words);
    });

    test('mnemonicToEntropy', async () => {
      expect(await mnemonicToEntropy(words, WORDLIST)).toEqual(entropy);
    });

    test('mnemonicToSeed', async () => {
      expect(new Uint8Array(await mnemonicToSeed(mnemonic, 'TREZOR'))).toEqual(hex2Bytes(seedHex));
    });
  });
});

test('Catch invalid lengths', () => {
  const entropy = english[0][0] + english[0][0];
  const mnemonic = (english[0][1] + english[0][1]).split(' ');
  for (let i = 0; i < 33; i++) {
    if (i < 16 || i > 32 || i % 4 != 0) {
      const truncatedEntropy = hex2Bytes(entropy.slice(0, i));
      expect(entropyToMnemonic(truncatedEntropy, WORDLIST)).rejects.toThrow(
        'Invalid entropy length',
      );
    }
    if (i < 12 || i > 24 || i % 3 != 0) {
      const truncatedMnemonic = mnemonic.slice(0, i);
      expect(mnemonicToEntropy(truncatedMnemonic, WORDLIST)).rejects.toThrow(
        'Invalid mnemonic length',
      );
    }
  }
});

test('Catch non-wordlist words', () => {
  const mnemonic = Array.from({ length: 12 }, () => 'notaword');
  expect(mnemonicToEntropy(mnemonic, WORDLIST)).rejects.toThrow('not in wordlist');
});

test('Catch invalid checksum', () => {
  const mnemonic = english[0][1].split(' ');
  const badMnemonic = mnemonic.slice(0, mnemonic.length - 1);
  badMnemonic.push('bacon');
  expect(mnemonicToEntropy(badMnemonic, WORDLIST)).rejects.toThrow('Invalid checksum');
});
