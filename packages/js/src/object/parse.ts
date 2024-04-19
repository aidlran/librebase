import { textDecoder } from '../shared';
import { validateObjectPayloadMediaType, validateObjectVersion } from './validate';
import type { ParsedObject } from './types';

export function getMediaTypeTerminateIndex(object: Uint8Array): number {
  let nulIndex: number | undefined;

  for (let i = 4; i < object.length; i++) {
    if (object[i] == 0) {
      nulIndex = i;
      break;
    }
  }

  if (nulIndex) {
    return nulIndex;
  }

  throw new TypeError('No NUL byte found');
}

export function parseObject(object: Uint8Array, trust = false): ParsedObject {
  const version = object[0];
  const nulIndex = getMediaTypeTerminateIndex(object);
  const mediaTypeBytes = object.subarray(1, nulIndex);

  if (!trust) {
    if (!validateObjectVersion(version)) {
      throw new TypeError('Unsupported object version: ' + version);
    }
    if (!validateObjectPayloadMediaType(mediaTypeBytes)) {
      throw new TypeError('Bad media type');
    }
  }

  return [version, textDecoder.decode(mediaTypeBytes), object.subarray(nulIndex + 1)];
}
