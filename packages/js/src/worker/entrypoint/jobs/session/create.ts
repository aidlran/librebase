import { entropyToMnemonic } from '../../../../crypto/mnemonic/bip39';
import type { CreateKeyringRequest, CreateKeyringResult } from '../../../types';

export const createSession = async (
  save: (
    payload: Uint8Array,
    passphrase: string,
    metadata: unknown,
    id?: number,
  ) => Promise<number>,
  request: CreateKeyringRequest,
): Promise<CreateKeyringResult> => {
  if (!request.passphrase) throw new TypeError('passphrase cannot be blank');
  const entropy = crypto.getRandomValues(new Uint8Array(16));
  const mnemonic = await entropyToMnemonic(entropy);
  const id = await save(entropy, request.passphrase, request.metadata);
  return { mnemonic, id };
};
