import ecc from '@bitcoinerlab/secp256k1';
import { Base58 } from '@librebase/core/internal';
import { BIP32Factory } from 'bip32';
import { integer, number, optional, record, safeParse, string, type Input } from 'valibot';
import { getIdentityValue, putIdentity } from '../main/identity.js';
import { KdfType } from '../shared/constants.js';
import { activeSeeds } from './keyring.js';

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

export async function getIdentity(id: string, instanceID?: string) {
  const bip32 = getBIP32(instanceID);
  const indexKey = bip32.deriveHardened(0);
  const address = new Uint8Array([KdfType.secp256k1_hd, ...indexKey.publicKey]);
  const response = await getIdentityValue(address, instanceID);
  if (!safeParse(indexSchema, response).success) {
    throw new Error('Got invalid index data');
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
  if (needPush) {
    await putIdentity(address, indexData, 'application/json', { instanceID });
  }
  return identity;
}
