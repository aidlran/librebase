import type { MediaType } from 'content-type';

/** @deprecated Use `@librebase/fs` */
export interface CodecProps {
  instanceID?: string;
  mediaType: MediaType;
}

/** @deprecated Use `@librebase/fs` */
export interface Codec<T = unknown> {
  encode(data: T, props: CodecProps): Uint8Array | Promise<Uint8Array>;
  decode(payload: Uint8Array, props: CodecProps): T | Promise<T>;
}
