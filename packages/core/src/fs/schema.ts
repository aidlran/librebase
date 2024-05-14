import { hash } from '../hash';
import type { IdentifierSchema } from '../identifier';
import { parseFsContent, type ParsedFsContent } from './parse';

/** Provides a content addressable file system. */
export const FsSchema: IdentifierSchema<ParsedFsContent> = {
  type: 0,
  async parse(rawCID, rawContent) {
    const cid = new Uint8Array(rawCID);
    const content = new Uint8Array(rawContent);

    // Will throw if content is malformed or unsupported
    const parsed = parseFsContent(new Uint8Array(rawContent));

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

    return parsed;
  },
};
