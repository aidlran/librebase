import { type IdentifierSchema } from '@librebase/core';
import { decodeWithCodec } from './codec';
import { hash } from './hash';
import { parseFsContent } from './parse';

/** Provides a content addressable file system. */
export const FsSchema: IdentifierSchema<unknown> = {
  type: 0,
  async parse(rawCID, rawContent, instanceID?: string) {
    const cid = new Uint8Array(rawCID);
    const content = new Uint8Array(rawContent);

    // Will throw if content is malformed or unsupported
    const [, mediaType, payload] = parseFsContent(new Uint8Array(rawContent));

    // The content hash must match up with the CID
    const givenHash = cid.subarray(1);
    const calculatedHash = (await hash(cid[0], content)).value;
    /** @todo Consider an independent buffer comparison function */
    if (calculatedHash.length !== givenHash.length) {
      return;
    }
    for (let i = 0; i < calculatedHash.length; i++) {
      if (calculatedHash[i] !== givenHash[i]) {
        return;
      }
    }

    return decodeWithCodec(payload, mediaType, instanceID);
  },
};
