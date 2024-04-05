import { textDecoder } from '../shared';
import { checkMediaType, checkVersion } from './check';
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
  if (!trust) {
    checkVersion(version);
  }

  const nulIndex = getMediaTypeTerminateIndex(object);

  const mediaTypeBytes = object.subarray(1, nulIndex);
  if (!trust) {
    checkMediaType(mediaTypeBytes);
  }

  return [version, textDecoder.decode(mediaTypeBytes), object.subarray(nulIndex + 1)];
}
