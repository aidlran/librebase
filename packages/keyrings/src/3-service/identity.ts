import ecc from '@bitcoinerlab/secp256k1';
import { Base58 } from '@librebase/core/internal';
import { BIP32Factory, type BIP32Interface } from 'bip32';
import { integer, number, optional, record, safeParse, string, type Input } from 'valibot';
import { KdfType } from '../kdf/types';
import { createDispatch } from '../worker/dispatch/create-dispatch';
import {
  WorkerDataRequestType,
  WorkerMessageType,
  type GetRootNodeRequest,
  type SetRootNodeRequest,
  type WorkerDataRequest,
} from '../worker/types';
import { activeSeeds } from './keyring';

const dispatch = createDispatch<WorkerDataRequest, unknown>(self, 1);

const indexSchema = optional(record(string(), number([integer()])));
type IndexData = Input<typeof indexSchema>;

const identityPubKeyMap: Record<string, string> = {};

export function getBIP32(instanceID?: string) {
  const seed = activeSeeds[instanceID ?? ''];
  if (!seed) {
    throw new Error('No active seed');
  }
  return BIP32Factory(ecc).fromSeed(Buffer.from(seed));
}

export async function findPrivateKey(address: Uint8Array, instanceID?: string): Promise<Buffer> {
  const indexKey = getBIP32(instanceID).deriveHardened(0);
  const stringifiedPubKey = Base58.encode(address.subarray(1));
  let privateKey: Buffer | undefined;
  if (stringifiedPubKey === Base58.encode(indexKey.publicKey)) {
    privateKey = indexKey.privateKey;
  } else {
    const identityID = identityPubKeyMap[stringifiedPubKey];
    if (!identityID) {
      throw new TypeError('No private key available');
    }
    privateKey = (await getIdentity(identityID)).privateKey;
  }
  if (!privateKey) {
    throw new TypeError('No private key available');
  }
  return privateKey;
}

export function getIdentity(id: string, instanceID?: string) {
  return new Promise<BIP32Interface>((resolve, reject) => {
    const bip32 = getBIP32(instanceID);
    const indexKey = bip32.deriveHardened(0);
    const indexRequest: GetRootNodeRequest = [
      WorkerMessageType.DATA,
      WorkerDataRequestType.GET_ROOT_NODE,
      KdfType.secp256k1_hd,
      new Uint8Array(indexKey.publicKey),
    ];
    dispatch(indexRequest, (response) => {
      if (!safeParse(indexSchema, response).success) {
        return reject('Got invalid index data');
      }
      const indexData: IndexData = (response as IndexData) ?? { [id]: 0 };
      let keyIndex = indexData[id];
      const needPush = !response || !keyIndex;
      if (!keyIndex) {
        const orderedIDs = Object.values(indexData).sort((a, b) => a - b);
        keyIndex = orderedIDs.length ? orderedIDs.pop()! + 1 : 0;
        indexData[id] = keyIndex;
      }
      const identity = bip32.deriveHardened(1).deriveHardened(keyIndex);
      identityPubKeyMap[Base58.encode(identity.publicKey)] = id;
      const res = () => resolve(identity);
      if (needPush) {
        const indexUpdate: SetRootNodeRequest = [
          WorkerMessageType.DATA,
          WorkerDataRequestType.SET_ROOT_NODE,
          KdfType.secp256k1_hd,
          new Uint8Array(indexKey.publicKey),
          'application/json',
          indexData,
        ];
        dispatch(indexUpdate, res);
      } else res();
    });
  });
}
