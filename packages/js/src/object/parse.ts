import { textDecoder } from '../shared';
import { validateSerializedObjectMediaType, validateObjectVersion } from './validate';

export type ParsedObject = [version: number, mediaType: string, payload: Uint8Array];

export function parseObject(object: Uint8Array, trust = false): ParsedObject {
  const nulIndex = object.indexOf(0, 4);

  if (nulIndex === -1) {
    throw new TypeError('No NUL byte');
  }

  const version = object[0];
  const mediaTypeBytes = object.subarray(1, nulIndex);

  if (!trust) {
    if (!validateObjectVersion(version)) {
      throw new TypeError('Unsupported object version: ' + version);
    }
    if (!validateSerializedObjectMediaType(mediaTypeBytes)) {
      throw new TypeError('Bad media type');
    }
  }

  return [version, textDecoder.decode(mediaTypeBytes), object.subarray(nulIndex + 1)];
}
