import { tick } from '@adamantjs/signals';
import type { RetrievedNodeData } from '../channel';
import { raceChannels } from '../channel/race';
import { base58 } from '../crypto';
import { error, log, loggingEnabled } from '../logger/logger';
import type { Injector } from '../modules/modules';
import { createNode } from './create-node';

export function getNode(this: Injector) {
  return (hash: Uint8Array) => {
    loggingEnabled && log('Retrieving node with hash', base58.encode(hash));
    return this(raceChannels)(
      (channel) => channel.getNode(hash),
      (data) => this(parseSerializedNode)(data, hash),
    );
  };
}

export function getAddressedNode(this: Injector) {
  return (address: Uint8Array) => {
    loggingEnabled && log('Retrieving node hash for address', base58.encode(address));
    const result = this(raceChannels)(
      (channel) => channel.getAddressedNodeHash(address),
      (hash) => this(getNode)(hash),
    );
    if (loggingEnabled) {
      result.then((v) => {
        if (v) {
          v.hash().then((h) =>
            log('Node for address', base58.encode(address), `found. Hash: ${base58.encode(h)}`),
          );
        } else {
          log('Node for address', base58.encode(address), 'not found');
        }
      });
    }
    return result;
  };
}

export function parseSerializedNode(this: Injector) {
  return async (data: RetrievedNodeData, hash: Uint8Array) => {
    if (loggingEnabled) {
      log('Node with hash', base58.encode(hash), 'hash alg is', hash[0], 'media type is', data[0]);
    }
    const node = await this(createNode)()
      .setHashAlg(hash[0])
      .setMediaType(data[0])
      .setPayload(data[1]);
    await tick();
    if (loggingEnabled) {
      log('Node with hash', base58.encode(hash), 'unwrapped value is', node.value());
    }
    const checkHash = await node.hash();
    if (hash.length != checkHash.length) return rejectHash(hash);
    for (const i in hash) if (hash[i] !== checkHash[i]) return rejectHash(hash);
    if (loggingEnabled) {
      log('Node with hash', base58.encode(hash), 'passed hash validation');
    }
    return node;
  };
}

function rejectHash(hash: Uint8Array) {
  error('Node with hash', base58.encode(hash), 'failed hash validation');
}
