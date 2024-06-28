import { parse, type MediaType } from 'content-type';
import type { MaybePromise } from '../core/channels.js';
import { Registry, stringToBytes, type RegistryModule } from '../internal/index.js';
import { json } from '../json/codec.js';
import { binary } from '../middleware/binary.js';
import { WrapMiddleware } from '../wraps/middleware.js';
import { validateMediaType } from './media-types.js';

export interface CodecProps {
  instanceID?: string;
  mediaType: MediaType;
}

export interface Codec<T = unknown> extends RegistryModule<string> {
  /**
   * Decodes bytes into the value.
   *
   * @param payload The bytes to decode.
   * @param props Additional properties that may be needed.
   * @returns The decoded value or a promise that resolves with the decoded value.
   */
  decode(payload: Uint8Array, props: CodecProps): MaybePromise<T>;
  /**
   * Encodes a value to bytes.
   *
   * @param data The value to encode.
   * @param props Additional properties that may be needed.
   * @returns The encoded bytes or a promise that resolves with the encoded bytes.
   */
  encode(data: T, props: CodecProps): MaybePromise<Uint8Array>;
}

export const CodecRegistry = new Registry<string, Codec>({
  defaults: {
    'application/json': json(binary, WrapMiddleware),
    'application/octet-stream': {
      decode: (v) => v,
      encode: (v) => v,
    } satisfies Codec<Uint8Array>,
  },
  validateKey: (key) => validateMediaType(stringToBytes(key)),
  validateModule: (value) =>
    typeof value.decode === 'function' && typeof value.encode === 'function',
});

export function decodeWithCodec<T>(
  payload: Uint8Array,
  mediaType: string | MediaType,
  instanceID?: string,
): Promise<T> {
  try {
    mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = CodecRegistry.getStrict(mediaType.type, instanceID) as Codec<T>;
    return Promise.resolve(codec.decode(payload, { instanceID, mediaType }));
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function encodeWithCodec(
  input: unknown,
  mediaType: string | MediaType,
  instanceID?: string,
): Promise<Uint8Array> {
  try {
    mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = CodecRegistry.getStrict(mediaType.type, instanceID);
    return Promise.resolve(codec.encode(input, { instanceID, mediaType }));
  } catch (e) {
    return Promise.reject(e);
  }
}
