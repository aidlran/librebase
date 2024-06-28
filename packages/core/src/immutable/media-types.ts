export function validateMediaType(mediaType: Uint8Array): boolean {
  let once = false;
  let slashCount = 0;

  for (const byte of mediaType) {
    if (
      // Control char
      byte < 0x20 ||
      // Back slash
      byte == 0x5c ||
      // DEL
      byte == 0x7f ||
      // Forward slash (at beginning or multiple)
      (byte == 0x2f && (!once || ++slashCount > 1))
    ) {
      return false;
    }
    once = true;
  }

  return slashCount == 1;
}
