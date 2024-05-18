import { type IdentifierSchema } from '@librebase/core';
import { decodeWithCodec } from './codec';
import { hash } from './hash';
import { parseFsContent } from './parse';

/** Provides a content addressable file system. */
export const FsSchema = {
  key: 1,
  async parse(cid, content, instanceID?: string) {
    cid = new Uint8Array(cid);
    content = new Uint8Array(content);

    // Will throw if content is malformed or unsupported
    const [, mediaType, payload] = parseFsContent(content as Uint8Array);

    // The content hash must match up with the CID
    const givenHash = (cid as Uint8Array).subarray(1);
    const calculatedHash = (await hash((cid as Uint8Array)[0], content as Uint8Array)).value;
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
} satisfies IdentifierSchema;
