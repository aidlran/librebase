import { toBufferSource } from '../common/buffer-utils';

export function sha256(payload: string | BufferSource) {
  const byteArray = toBufferSource(payload);
  return self.crypto.subtle.digest('SHA-256', byteArray);
}
