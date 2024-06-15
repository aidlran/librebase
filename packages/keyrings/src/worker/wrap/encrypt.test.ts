import { Hash, HashAlgorithm } from '@librebase/fs';
import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { EncryptWrapSchema, defaultMetadata } from './encrypt';

describe('Encrypt wrap schema - wrap', () => {
  it('Throws if no key derivation input provided', () => {
    expect(
      EncryptWrapSchema.wrap({
        hash: new Hash(HashAlgorithm.SHA256, new Uint8Array()),
        metadata: {},
        payload: crypto.getRandomValues(new Uint8Array(8)),
      }),
    ).rejects.toThrow('No key derivation input was provided');
  });

  it('Works if passphrase provided', async () => {
    const inputPayload = crypto.getRandomValues(new Uint8Array(8));
    const inputMetadata = {
      passphrase: new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(8))),
    };

    const [encryptResultPayload, encryptResultMetadata] = await EncryptWrapSchema.wrap({
      hash: new Hash(HashAlgorithm.SHA256, new Uint8Array()),
      metadata: inputMetadata,
      payload: inputPayload,
    });

    expect(encryptResultPayload).toBeInstanceOf(Uint8Array);
    expect(encryptResultMetadata.encAlg).toBe(defaultMetadata.encAlg);
    expect(encryptResultMetadata.hashAlg).toBe(defaultMetadata.hashAlg);
    expect(encryptResultMetadata.iterations).toBe(defaultMetadata.iterations);
    expect(encryptResultMetadata.kdf).toBe(defaultMetadata.kdf);

    const [decryptResultPayload, decryptResultMetadata] = await EncryptWrapSchema.unwrap({
      metadata: encryptResultMetadata,
      payload: encryptResultPayload,
    } as never);

    expect(decryptResultPayload).toEqual(inputPayload);
    expect(decryptResultMetadata.encAlg).toBe(defaultMetadata.encAlg);
    expect(decryptResultMetadata.hashAlg).toBe(defaultMetadata.hashAlg);
    expect(decryptResultMetadata.iterations).toBe(defaultMetadata.iterations);
    expect(decryptResultMetadata.iv).toEqual(encryptResultMetadata.iv);
    expect(decryptResultMetadata.kdf).toBe(defaultMetadata.kdf);
    expect(decryptResultMetadata.salt).toEqual(encryptResultMetadata.salt);
  });

  it.todo('Works if known pubKey provided');
});
