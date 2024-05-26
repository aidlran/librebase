import { getChannels, Identifier, IdentifierRegistry, type ChannelDriver } from '@librebase/core';
import { format, type MediaType } from 'content-type';
import { beforeAll, describe, expect, it, test } from 'vitest';
import { mockJSONCodec } from '../testing/codecs';
import { CodecRegistry } from './codecs';
import {
  deleteFile,
  fileVersionIsSupported,
  getFile,
  parseFileContent,
  putFile,
  serializeFileContent,
} from './files';
import { Hash, HashAlgorithm } from './hashes';
import { FS } from './schema';

describe('File operations', () => {
  const instanceID = 'File Operations';
  const mockDriverA: ChannelDriver = {};
  const mockDriverB: ChannelDriver = {};
  const channels = getChannels(instanceID);

  channels.push(mockDriverA, mockDriverB);
  CodecRegistry.register(mockJSONCodec, { instanceID });
  IdentifierRegistry.register(FS, { instanceID });

  function createHash() {
    return crypto.getRandomValues(new Uint8Array(33));
  }

  describe('Delete file', () => {
    const baseHash = new Hash(HashAlgorithm.SHA256, createHash());
    const testCases = [
      ['Uint8Array', baseHash.toBytes()],
      ['Hash', baseHash],
    ] as const;
    for (const [paramType, requestHash] of testCases) {
      test('With ' + paramType, async () => {
        let calls = 0;
        function deleteMock(id: Identifier) {
          calls++;
          expect(id.value).toEqual(baseHash.toBytes());
        }
        mockDriverA.delete = deleteMock;
        mockDriverB.delete = deleteMock;
        await expect(deleteFile(requestHash, instanceID)).resolves.toBeUndefined();
        expect(calls).toBe(2);
      });
    }
  });

  test('Get file', async () => {
    const instanceID = 'Get File';

    const existing = crypto.getRandomValues(new Uint8Array(16));
    const existingCID = new Uint8Array([FS.key, ...existing]);

    getChannels(instanceID).push({
      get(id) {
        if (id.bytes.length !== existingCID.length) {
          return;
        }
        for (let i = 0; i < id.bytes.length; i++) {
          if (id.bytes[i] !== existingCID[i]) {
            return;
          }
        }
        return id.bytes;
      },
    });

    IdentifierRegistry.register({ key: FS.key, parse: (_, v) => v }, { instanceID });

    for (const cid of [existing, new Hash(existing[0], existing.subarray(1))]) {
      await expect(getFile(cid, instanceID)).resolves.toEqual(existingCID);
    }

    const nonExistent = crypto.getRandomValues(new Uint8Array(16));
    for (const cid of [nonExistent, new Hash(nonExistent[0], nonExistent.subarray(1))]) {
      await expect(getFile(cid, instanceID)).resolves.toBeUndefined();
    }
  });

  test('Put file', async () => {
    const value = { test: 'test' };
    const mediaType = 'application/json';
    let calls = 0;
    function putMock(id: Identifier, object: Uint8Array) {
      calls++;
      expect(id.value).toBeInstanceOf(Uint8Array);
      expect(object).toBeInstanceOf(Uint8Array);
    }
    mockDriverA.put = putMock;
    mockDriverB.put = putMock;
    await expect(putFile(value, mediaType, { instanceID })).resolves.toBeInstanceOf(Hash);
    expect(calls).toBe(2);
  });
});

describe('Parse file content', () => {
  const randomBytes = new Uint8Array(Array.from({ length: 16 }, (_, k) => k + 1));
  const goodMediaTypeString = 'text/plain';
  const goodMediaTypeBytes = new TextEncoder().encode(goodMediaTypeString);

  it('Throws if no media type NUL terminator found', () => {
    expect(() => parseFileContent(randomBytes)).toThrow('No NUL byte');
  });

  it('Parses supported file content', () => {
    const version = 1;
    const object = new Uint8Array([version, ...goodMediaTypeBytes, 0, ...randomBytes]);
    const [v, m, p] = parseFileContent(object);
    expect(v).toBe(version);
    expect(m).toBe(goodMediaTypeString);
    expect(p).toEqual(randomBytes);
  });

  it('Throws if an unknown version if encountered', () => {
    const object = new Uint8Array([2, ...goodMediaTypeBytes, 0, ...randomBytes]);
    expect(() => parseFileContent(object)).toThrow('Unsupported FS version');
  });

  it('Throws if a bad media type is encountered', () => {
    const object = new Uint8Array([1, ...randomBytes, 0, ...randomBytes]);
    expect(() => parseFileContent(object)).toThrow('Bad media type');
  });

  it('Skips validation with trusted mode enabled', () => {
    const version = 2;
    const object = new Uint8Array([version, ...goodMediaTypeBytes, 0, ...randomBytes]);
    const [v, m, p] = parseFileContent(object, true);
    expect(v).toBe(version);
    expect(m).toBe(goodMediaTypeString);
    expect(p).toEqual(randomBytes);
  });
});

describe('Serialize FS content', () => {
  const instanceID = 'serialize-object';
  const textEncoder = new TextEncoder();

  beforeAll(() => {
    CodecRegistry.register(mockJSONCodec, { instanceID });
  });

  describe('Serializes valid FS content', () => {
    const tests: [unknown, string | MediaType][] = [
      [{ test: 'test' }, 'application/json'],
      [{ test: 'test' }, { type: 'application/json' }],
    ];
    for (const [value, mediaType] of tests) {
      test(typeof value + ' value + ' + typeof mediaType + ' media type', () => {
        const mediaTypeString = typeof mediaType === 'string' ? mediaType : format(mediaType);
        const mediaTypeBin = textEncoder.encode(mediaTypeString);
        const payload = textEncoder.encode(JSON.stringify(value));
        const object = new Uint8Array([1, ...mediaTypeBin, 0, ...payload]);
        expect(serializeFileContent(value, mediaType, { instanceID })).resolves.toEqual(object);
      });
    }
  });

  it('Serializes a valid pre-encoded FS content', () => {
    const mediaTypeString = 'application/json';
    const mediaTypeBin = textEncoder.encode(mediaTypeString);
    const payload = textEncoder.encode(JSON.stringify({ test: 'test' }));
    const object = new Uint8Array([1, ...mediaTypeBin, 0, ...payload]);
    expect(
      serializeFileContent(payload, mediaTypeString, { encoded: true, instanceID }),
    ).resolves.toEqual(object);
  });

  it('Throws on unexpected non-encoded payload', () => {
    const payload = { test: 'test' } as never;
    const request = serializeFileContent(payload, 'application/json', {
      encoded: true,
      instanceID,
    });
    expect(request).rejects.toThrow('Expected Uint8Array');
  });

  describe('Media type validation', () => {
    const badMediaType = String.fromCharCode(...Array.from({ length: 16 }, (_, k) => k));

    it('Throws on bad media type', () => {
      const request = serializeFileContent(new Uint8Array(8), badMediaType, {
        encoded: true,
        instanceID,
      });
      expect(request).rejects.toThrow('Bad media type');
    });

    it('Skips validation with trust option enabled', () => {
      const payload = new Uint8Array(8);
      const request = serializeFileContent(payload, badMediaType, {
        encoded: true,
        instanceID,
        trust: true,
      });
      const object = new Uint8Array([1, ...textEncoder.encode(badMediaType), 0, ...payload]);
      expect(request).resolves.toEqual(object);
    });
  });
});

describe('Validate file version', () => {
  it('Should pass known versions', () => {
    expect(fileVersionIsSupported(1)).toBe(true);
  });

  it("Should fail future versions we don't know about", () => {
    for (let n = 2; n < 256; n++) {
      expect(fileVersionIsSupported(n)).toBe(false);
    }
  });

  it('Should fail invalid versions', () => {
    for (let n = 0; n > -999; n--) {
      expect(fileVersionIsSupported(n)).toBe(false);
    }
  });
});
