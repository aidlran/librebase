import { mnemonicToEntropy } from '../../../../mnemonic/bip39';
import type { ImportKeyringRequest, ImportKeyringResult } from '../../../types';

export async function importKeyring(
  save: (
    payload: Uint8Array,
    passphrase: string,
    metadata: unknown,
    id?: number,
  ) => Promise<number>,
  request: ImportKeyringRequest,
): Promise<ImportKeyringResult> {
  if (!request.passphrase) throw new TypeError('passphrase cannot be blank');
  const entropy = mnemonicToEntropy(request.mnemonic);
  const id = await save(entropy, request.passphrase, request.metadata);
  return { id };
}
