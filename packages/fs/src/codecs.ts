import { stringToBytes } from '@librebase/core';
import { Registry, type RegistryModule } from '@librebase/core/internal';
import { parse, type MediaType } from 'content-type';
import { validateMediaType } from './media-types';

export interface CodecProps {
  instanceID?: string;
  mediaType: MediaType;
}

export interface Codec<T = unknown> extends RegistryModule<string> {
  encode(data: T, props: CodecProps): Uint8Array | Promise<Uint8Array>;
  decode(payload: Uint8Array, props: CodecProps): T | Promise<T>;
}

export const CodecRegistry = new Registry<string, Codec>({
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
