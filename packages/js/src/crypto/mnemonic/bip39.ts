import { sha256 } from '../hash/sha256.js';
import WORDLIST from './bip39-wordlist-english.json';

/**
 * Generate a BIP39 mnemonic code.
 *
 * @param entropy Valid values are 128, 160, 192, 224, or 256 bits in length. Greater entropy
 *   lengths result in greater security but greater sentence length.
 * @returns A 12 to 24 word mnemonic.
 */
export async function entropyToMnemonic(entropy: Uint8Array): Promise<string> {
  if (![16, 20, 24, 28, 32].includes(entropy.length)) {
    throw TypeError('Entropy length must be must be 128 | 160 | 192 | 224 | 256 bits');
  }

  const CHECKSUM_LENGTH = entropy.length / 4;

  const CHECKSUM = sha256(entropy).then((hash) => {
    const SHIFT = 8 - CHECKSUM_LENGTH;
    const BITMASK = CHECKSUM_LENGTH == 8 ? 0xff : (0xff >> SHIFT) << SHIFT;
    return new Uint8Array(hash)[0] & BITMASK;
  });

  let mnemonicInt = 0n;

  for (const BYTE of entropy) {
    mnemonicInt = (mnemonicInt << 8n) + BigInt(BYTE);
  }

  mnemonicInt = (mnemonicInt << BigInt(CHECKSUM_LENGTH)) | BigInt(await CHECKSUM);

  let mnemonicString = '';
  const BITMASK = (1n << 11n) - 1n;

  while (mnemonicInt > 0n) {
    mnemonicString = `${WORDLIST[Number(mnemonicInt & BITMASK)]} ${mnemonicString}`;
    mnemonicInt >>= 11n;
  }

  return mnemonicString.trimEnd();
}

export function mnemonicToEntropy(mnemonic: string): Uint8Array {
  const wordArray = mnemonic.split(' ');
  let bits = '';
  for (const word of wordArray) {
    const index = WORDLIST.indexOf(word);
    if (index < 0) throw new TypeError('Invalid mnemonic');
    else bits += index.toString(2).padStart(11, '0');
  }
  const entropyLength = wordArray.length * 11 - wordArray.length / 3;
  const checksumLength = BigInt(entropyLength / 32);

  const entropyBits = bits.slice(0, entropyLength);
  const checksumBits = bits.slice(entropyLength);

  let entropy = 0n;
  for (let i = 0; i < entropyLength; i++) {
    entropy <<= 1n;
    entropy += BigInt(entropyBits[i]);
  }

  const checksumMask = (1n << checksumLength) - 1n;
  const calculatedChecksum = entropy & checksumMask;
  const providedChecksum = BigInt('0b' + checksumBits);

  if (calculatedChecksum !== providedChecksum) {
    throw new TypeError('Invalid mnemonic');
  }

  entropy >>= BigInt(checksumLength);

  const entropyBytes = [];
  while (entropy > 0n) {
    entropyBytes.unshift(Number(entropy & 0xffn));
    entropy >>= 8n;
  }

  return new Uint8Array(entropyBytes);
}

export async function mnemonicToSeed(mnemonic: string, passphrase = ''): Promise<ArrayBuffer> {
  const ENCODER = new TextEncoder();

  const MNEMONIC = ENCODER.encode(mnemonic);
  const SALT = ENCODER.encode(`mnemonic${passphrase}`);

  const BASE_KEY = await crypto.subtle.importKey('raw', MNEMONIC, 'PBKDF2', false, ['deriveBits']);

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      iterations: 2048,
      salt: SALT,
    },
    BASE_KEY,
    512,
  );
}
