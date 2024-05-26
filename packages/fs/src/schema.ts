import { type IdentifierSchema } from '@librebase/core';
import { validateCID } from './cid';
import { decodeWithCodec } from './codecs';
import { parseFileContent } from './files';

/** Provides a content addressed file system. */
export const FS = {
  key: 1,
  async parse(cid, content, instanceID?: string) {
    if (!(await validateCID(cid.value, content))) {
      return;
    }
    // Will throw if content is malformed or unsupported
    const [, mediaType, payload] = parseFileContent(new Uint8Array(content));
    return decodeWithCodec(payload, mediaType, instanceID);
  },
} satisfies IdentifierSchema;
