import type { BIP32Interface } from 'bip32';
import { KdfType } from '../../../../crypto/kdf/types';
import type { Dispatch } from '../../../dispatch/create-dispatch';
import {
  type GetNodeRequest,
  type GetNodeResponse,
  WorkerDataRequestType,
  WorkerMessageType,
} from '../../../types';

type IndexData = Record<string, number>;

export function getIdentity(
  dispatch: Dispatch<GetNodeRequest, GetNodeResponse>,
  id: string,
  keyring?: BIP32Interface,
) {
  if (!keyring) throw new TypeError('No active keyring');
  return new Promise<Uint8Array>((resolve) => {
    const indexKey = keyring.deriveHardened(0);
    const indexRequest: GetNodeRequest = [
      WorkerMessageType.DATA,
      WorkerDataRequestType.GET_ROOT_NODE,
      KdfType.secp256k1_hd,
      new Uint8Array(indexKey.publicKey),
    ];
    dispatch(indexRequest, (response) => {
      // TODO: may be a good idea to validate the data structure
      const indexData: IndexData = (response as IndexData) ?? { [id]: 0 };
      let keyIndex = indexData[id];
      // const needPush = !response || !keyIndex;
      if (!keyIndex) {
        const orderedIDs = Object.values(indexData).sort((a, b) => a - b);
        keyIndex = orderedIDs.length ? orderedIDs.pop()! + 1 : 0;
        indexData[id] = keyIndex;
      }
      resolve(keyring.deriveHardened(1).deriveHardened(keyIndex).publicKey);
      // TODO: push indexData if necessary
    });
  });
}