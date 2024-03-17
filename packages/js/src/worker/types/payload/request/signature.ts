export interface SignatureRequest {
  identityID: string;
  hash: Uint8Array;
}

export interface VerifySignatureRequest extends SignatureRequest {
  signature: Uint8Array;
}
