import { sha256 } from '@librebase/fs';
import WORDLIST from './bip39-wordlist-english.json';

export { WORDLIST as BIP39_WORDLIST_ENGLISH };

async function deriveChecksum(entropy: Uint8Array) {
  return toBinaryString(new Uint8Array(await sha256(entropy))).slice(0, entropy.length / 4);
}

function toBinaryString(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(2).padStart(8, '0')).join('');
}

/**
 * Generate a BIP39 mnemonic code.
 *
 * @param entropy Valid values are 128, 160, 192, 224, or 256 bits in length. Greater entropy
 *   lengths result in greater security but greater sentence length.
 * @returns A 12 to 24 word mnemonic.
 */
export async function entropyToMnemonic(entropy: Uint8Array, wordlist = WORDLIST) {
  if (entropy.length < 16 || entropy.length > 32 || entropy.length % 4 != 0) {
    throw TypeError('Invalid entropy length');
  }
  return (toBinaryString(entropy) + (await deriveChecksum(entropy)))
    .match(/(.{1,11})/g)!
    .map((chunk) => wordlist[parseInt(chunk, 2)]);
}

export async function mnemonicToEntropy(mnemonic: string[], wordlist = WORDLIST) {
  if (mnemonic.length < 12 || mnemonic.length > 24 || mnemonic.length % 3 != 0) {
    throw TypeError('Invalid mnemonic length');
  }
  mnemonic = mnemonic.map((word) => word.normalize('NFKD').trim());
  const bits = mnemonic
    .map((word) => {
      const index = wordlist.indexOf(word);
      if (index == -1) {
        throw new TypeError('Mnemonic word not in wordlist');
      }
      return index.toString(2).padStart(11, '0');
    })
    .join('');
  const entropyLength = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, entropyLength);
  const entropyBytes = new Uint8Array(entropyBits.match(/(.{1,8})/g)!.map((b) => parseInt(b, 2)));
  if (bits.slice(entropyLength) !== (await deriveChecksum(entropyBytes))) {
    throw new Error('Invalid checksum');
  }
  return entropyBytes;
}

export async function mnemonicToSeed(mnemonic: string, passphrase = ''): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(mnemonic);
  const salt = encoder.encode(`mnemonic${passphrase}`);
  const key = await crypto.subtle.importKey('raw', keyMaterial, 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      iterations: 2048,
      salt: salt,
    },
    key,
    512,
  );
}
