import { base58, base64 } from './base-encode';

export type Encoding = 'raw' | 'base58' | 'base64';

export interface EncodingMap {
  raw: Uint8Array;
  base58: string;
  base64: string;
}

export function getMultipleEncodings<T extends Encoding, R extends Exclude<Encoding, T | 'raw'>[]>(
  input: EncodingMap[T],
  inputEncoding: T,
  outputEncodings: R,
): Pick<EncodingMap, 'raw' | T | R[number]> {
  const encodings: Partial<EncodingMap> = {
    [inputEncoding]: input,
  };

  if (inputEncoding === 'base58') {
    encodings.raw = base58.decode(input as string);
  } else if (inputEncoding === 'base64') {
    encodings.raw = base64.decode(input as string);
  }

  for (const enc of outputEncodings) {
    if (enc === 'base58') {
      encodings.base58 = base58.encode(encodings.raw!);
    } else if (enc === 'base64') {
      encodings.base64 = base64.encode(encodings.raw!);
    }
  }

  return encodings as Pick<EncodingMap, 'raw' | T | R[number]>;
}
