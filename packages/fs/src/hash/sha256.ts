export function sha256(payload: BufferSource) {
  return self.crypto.subtle.digest('SHA-256', payload);
}
