import { hash } from '../hash';
import type { IdentifierSchema } from '../identifier';
import { parseObject, type ParsedObject } from '../object';

/** Provides a content addressable file system. */
export const FS: IdentifierSchema<ParsedObject> = {
  type: 0,
  async parse(rawCID, rawContent) {
    const cid = new Uint8Array(rawCID);
    const content = new Uint8Array(rawContent);

    // Will throw if content is malformed or unsupported
    const parsed = parseObject(new Uint8Array(rawContent));

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
