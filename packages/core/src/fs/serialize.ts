import { format, type MediaType } from 'content-type';
import { encodeWithCodec } from '../codec';
import { textEncoder } from '../shared';
import { validateSerializedFsContentMediaType } from './validate';

/** @deprecated Use `@librebase/fs` */
export interface SerializeFsContentOptions {
  /**
   * Set to true to use a encoded payload. When this option is enabled, the value must be a
   * `Uint8Array`.
   *
   * @default false
   */
  encoded?: boolean;
  instanceID?: string;
  /**
   * Set to true to trust the parameter values and skip any validation.
   *
   * @default false
   */
  trust?: boolean;
}

/** @deprecated Use `@librebase/fs` */
export async function serializeFsContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: SerializeFsContentOptions & { encoded?: false },
): Promise<Uint8Array>;
/** @deprecated Use `@librebase/fs` */
export async function serializeFsContent(
  payload: Uint8Array,
  mediaType: string | MediaType,
  options: SerializeFsContentOptions & { encoded: true },
): Promise<Uint8Array>;
/** @deprecated Use `@librebase/fs` */
export async function serializeFsContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: SerializeFsContentOptions,
): Promise<Uint8Array> {
  let encodedPayload: Uint8Array;

  if (options?.encoded) {
    if (!(value instanceof Uint8Array)) {
      throw new TypeError('Expected Uint8Array');
    }
    encodedPayload = value;
  } else {
    encodedPayload = await encodeWithCodec(value, mediaType, options?.instanceID);
  }

  const mediaTypeBytes = textEncoder.encode(
    typeof mediaType === 'string' ? mediaType : format(mediaType),
  );

  if (!options?.trust && !validateSerializedFsContentMediaType(mediaTypeBytes)) {
    throw new Error('Bad media type');
  }

  return new Uint8Array([1, ...mediaTypeBytes, 0, ...encodedPayload]);
}
