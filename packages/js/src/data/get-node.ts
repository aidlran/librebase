import { tick } from '@adamantjs/signals';
import type { RetrievedNodeData } from '../channel';
import { raceChannels } from '../channel/race';
import { base58 } from '../crypto';
import { enabledLogLevels, error, getRequestID, log } from '../logger/logger';
import type { Injector } from '../modules/modules';
import { createNode } from './create-node';

export function getNode(this: Injector) {
  return (hash: Uint8Array, requestID = getRequestID()) => {
    if (enabledLogLevels.has('log')) {
      log({ requestID }, 'Retrieving', { hash: base58.encode(hash) });
    }
    const result = this(raceChannels)(
      (channel) => channel.getNode(hash),
      (data) => this(parseSerializedNode)(data, hash, requestID),
    );
    if (enabledLogLevels.has('log')) {
      result.then((v) => {
        log({ requestID }, v ? 'Found' : 'Not found', {
          hash: base58.encode(hash),
        });
      });
    }
    return result;
  };
}

export function getAddressedNode(this: Injector) {
  return (address: Uint8Array, requestID = getRequestID()) => {
    if (enabledLogLevels.has('log')) {
      log({ requestID }, 'Retrieving', { address: base58.encode(address) });
    }
    const result = this(raceChannels)(
      (channel) => channel.getAddressedNodeHash(address),
      (hash) => this(getNode)(hash, requestID),
    );
    if (enabledLogLevels.has('log')) {
      result.then((v) => {
        if (v) {
          v.hash().then((h) =>
            log({ requestID }, 'Found', {
              address: base58.encode(address),
              hash: base58.encode(h),
            }),
          );
        } else {
          log({ requestID }, 'Not found', { address: base58.encode(address) });
        }
      });
    }
    return result;
  };
}

export function parseSerializedNode(this: Injector) {
  return async (data: RetrievedNodeData, hash: Uint8Array, requestID: number) => {
    if (enabledLogLevels.has('log')) {
      log({ requestID }, 'Got node', {
        hash: base58.encode(hash),
        hashAlg: hash[0],
        mediaType: data[0],
      });
    }
    const node = await this(createNode)()
      .setHashAlg(hash[0])
      .setMediaType(data[0])
      .setPayload(data[1]);
    await tick();
    const checkHash = await node.hash();
    if (enabledLogLevels.has('log')) {
      log({ requestID }, 'Parsed node', {
        hash: base58.encode(hash),
        hashAlg: hash[0],
        mediaType: data[0],
        value: node.value(),
      });
    }
    if (hash.length != checkHash.length) return rejectHash(hash, requestID);
    for (const i in hash) if (hash[i] !== checkHash[i]) return rejectHash(hash, requestID);
    if (enabledLogLevels.has('log')) {
      log({ requestID }, 'Passed hash validation', { hash: base58.encode(hash) });
    }
    return node;
  };
}

function rejectHash(hash: Uint8Array, requestID: number) {
  error({ requestID }, 'Failed hash validation', { hash: base58.encode(hash) });
}
