import { decode, encode, encodingLength } from 'varint';

export function parseWirePayload(
  wireEncode: ArrayLike<number> | ArrayBufferLike,
): [number, Uint8Array] {
  const view = new Uint8Array(wireEncode);
  const type = decode(view);
  const payload = view.subarray(encodingLength(type));
  return [type, payload];
}

export function encodeWirePayload(kind: number, payload: ArrayLike<number> | ArrayBufferLike) {
  const typeBuf = encode(kind);
  const payloadBuf = new Uint8Array(payload);
  const output = new Uint8Array(typeBuf.length + payloadBuf.length);
  let i: number;
  for (i = 0; i < typeBuf.length; i++) {
    output[i] = typeBuf[i];
  }
  for (let j = 0; j < payloadBuf.length; i++, j++) {
    output[i] = payloadBuf[j];
  }
  return output;
}
