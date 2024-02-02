import { mnemonicToEntropy } from '../../../../crypto/mnemonic/bip39';
import type { ImportSessionRequest, ImportSessionResult } from '../../../types';

export const importSession = async (
  save: (
    payload: Uint8Array,
    passphrase: string,
    metadata: unknown,
    id?: number,
  ) => Promise<number>,
  request: ImportSessionRequest,
): Promise<ImportSessionResult> => {
  if (!request.passphrase) throw new TypeError('passphrase cannot be blank');
  const entropy = mnemonicToEntropy(request.mnemonic);
  const id = await save(entropy, request.passphrase, request.metadata);
  return { id };
};
