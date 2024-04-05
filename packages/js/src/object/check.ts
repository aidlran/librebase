export function checkMediaType(mediaType: Uint8Array) {
  let once = false;
  let slashCount = 0;
  for (const byte of mediaType) {
    if (byte < 0x20 || byte == 0x7f || (once && byte == 0x2f && ++slashCount > 1)) {
      throw new TypeError('Bad media type');
    }
    once = true;
  }
}

export function checkVersion(version: number) {
  if (version != 1) {
    throw new TypeError('Unsupported object version: ' + version);
  }
}
