export interface SignatureRequest {
  hash: Uint8Array;
  publicKey: Uint8Array;
}

export interface VerifySignatureRequest extends SignatureRequest {
  signature: Uint8Array;
}
