const encoder = new TextEncoder();

export function toBufferSource(input: string | BufferSource): BufferSource {
  return typeof input === 'string' ? encoder.encode(input) : input;
}

export function encodeByteArrayString(input: Uint8Array): string {
  let output = '';
  for (const index in input) {
    output += String.fromCharCode(input[index]);
  }
  return output;
}

export function concatenateByteArray(...arrays: Uint8Array[]): Uint8Array {
  let concatenatedArrayLength = 0;
  for (const array of arrays) {
    concatenatedArrayLength += array.length;
  }
  const concatenatedArray = new Uint8Array(concatenatedArrayLength);
  let offset = 0;
  for (const array of arrays) {
    concatenatedArray.set(array, offset);
    offset += array.length;
  }
  return concatenatedArray;
}

export function shred(buffer: Uint8Array) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = 0;
  }
}
