import { identifierToBytes, payloadToBytes } from '@librebase/core/internal';
import { Hash, hash } from './hashes';

/**
 * A CID value - An array of byte values, ArrayBuffer, {@linkcode Hash} instance, or base58 string.
 *
 * @category CID
 */
export type CIDLike = ArrayLike<number> | ArrayBufferLike | Hash | string;

/**
 * Coerces an CID-like value to a `Uint8Array`.
 *
 * @category CID
 * @param cid A valid CID value.
 * @returns A `Uint8Array`.
 */
export function cidToBytes(cid: CIDLike) {
  return cid instanceof Hash ? cid.toBytes() : identifierToBytes(cid);
}

/**
 * Checks whether a CID hash matches the content.
 *
 * @category CID
 * @param cid A valid CID value.
 * @param content A valid content payload.
 * @returns A promise that resolves with a boolean indicating whether or not the CID hash matches.
 */
export async function validateCID(
  cid: CIDLike,
  content: ArrayLike<number> | ArrayBufferLike | string,
) {
  cid = cidToBytes(cid);
  content = payloadToBytes(content);

  const givenHash = (cid as Uint8Array).subarray(1);
  const calculatedHash = (await hash((cid as Uint8Array)[0], content as Uint8Array)).value;

  if (calculatedHash.length !== givenHash.length) {
    return false;
  }
  for (let i = 0; i < calculatedHash.length; i++) {
    if (calculatedHash[i] !== givenHash[i]) {
      return false;
    }
  }

  return true;
}
