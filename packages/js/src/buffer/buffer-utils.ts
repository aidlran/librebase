export function stringToBytes(string: string): Uint8Array {
  const { length } = string;
  return new Uint8Array(Array.from({ length }, (_, k) => string.charCodeAt(k)));
}

export function bytesToString(bytes: Uint8Array): string {
  let output = '';
  for (const byte of bytes) {
    output += String.fromCharCode(byte);
  }
  return output;
}

export function shred(buffer: Uint8Array) {
  for (const i in buffer) {
    buffer[i] = 0;
  }
}
