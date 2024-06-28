import type { IdentifierSchema } from '../core/identifiers.js';
import { validateCID } from './cid.js';
import { decodeWithCodec } from './codecs.js';
import { parseFileContent } from './files.js';

/** {@linkcode IdentifierSchema} for immutable content-addressed files. */
export const Immutable = {
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
