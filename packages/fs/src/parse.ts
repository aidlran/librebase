import { validateSerializedFsContentMediaType, validateFsContentVersion } from './validate';

export type ParsedFsContent = [version: number, mediaType: string, payload: Uint8Array];

export function parseFsContent(content: Uint8Array, trust = false): ParsedFsContent {
  const nulIndex = content.indexOf(0, 4);

  if (nulIndex === -1) {
    throw new TypeError('No NUL byte');
  }

  const version = content[0];
  const mediaTypeBytes = content.subarray(1, nulIndex);

  if (!trust) {
    if (!validateFsContentVersion(version)) {
      throw new TypeError('Unsupported FS version: ' + version);
    }
    if (!validateSerializedFsContentMediaType(mediaTypeBytes)) {
      throw new TypeError('Bad media type');
    }
  }

  return [version, new TextDecoder().decode(mediaTypeBytes), content.subarray(nulIndex + 1)];
}
