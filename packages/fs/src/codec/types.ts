import type { RegistryValue } from '@librebase/core/internal';
import type { MediaType } from 'content-type';

export interface CodecProps {
  instanceID?: string;
  mediaType: MediaType;
}

export interface Codec<T = unknown> extends RegistryValue<string> {
  encode(data: T, props: CodecProps): Uint8Array | Promise<Uint8Array>;
  decode(payload: Uint8Array, props: CodecProps): T | Promise<T>;
}
