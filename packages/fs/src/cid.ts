import { hash } from './hashes';

export async function validateCID(
  cid: ArrayLike<number> | ArrayBufferLike,
  content: ArrayLike<number> | ArrayBufferLike,
) {
  cid = new Uint8Array(cid);
  content = new Uint8Array(content);

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
