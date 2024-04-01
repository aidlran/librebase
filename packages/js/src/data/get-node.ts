import { tick } from '@adamantjs/signals';
import { base58 } from '../buffer';
import type { RetrievedNodeData } from '../channel';
import { raceChannels } from '../channel/race';
import { error, getRequestID, log } from '../logger/logger';
import type { Injector } from '../modules/modules';
import { createNode } from './create-node';

export function getNode(this: Injector) {
  return (hash: Uint8Array, requestID = getRequestID()) => {
    void log(() => ['Retrieving', { hash: base58.encode(hash) }], {
      feature: 'retrieve',
      requestID,
    });
    const result = this(raceChannels)(
      (channel) => channel.getNode(hash),
      (data) => this(parseSerializedNode)(data, hash, requestID),
    );
    void log(async () => [(await result) ? 'Found' : 'Not found', { hash: base58.encode(hash) }], {
      feature: 'retrieve',
      requestID,
    });
    return result;
  };
}

export function getAddressedNode(this: Injector) {
  return (address: Uint8Array, requestID = getRequestID()) => {
    void log(() => ['Retrieving', { address: base58.encode(address) }], {
      feature: 'retrieve',
      requestID,
    });
    const result = this(raceChannels)(
      (channel) => channel.getAddressedNodeHash(address),
      (hash) => this(getNode)(hash, requestID),
    );

    void log(
      async () => {
        const encAddress = base58.encode(address);
        const node = await result;
        if (!node) return ['Not found', { address: encAddress }];
        const hash = base58.encode(await node.hash());
        return [
          'Found',
          {
            address: encAddress,
            hash,
          },
        ];
      },
      { feature: 'retrieve', requestID },
    );

    return result;
  };
}

export function parseSerializedNode(this: Injector) {
  return async (data: RetrievedNodeData, hash: Uint8Array, requestID: number) => {
    void log(
      () => [
        'Got node',
        {
          hash: base58.encode(hash),
          hashAlg: hash[0],
          mediaType: data[0],
        },
      ],
      { feature: 'retrieve', requestID },
    );
    const node = await this(createNode)()
      .setHashAlg(hash[0])
      .setMediaType(data[0])
      .setPayload(data[1]);
    await tick();
    const checkHash = await node.hash();
    void log(
      () => [
        'Parsed node',
        {
          hash: base58.encode(hash),
          hashAlg: hash[0],
          mediaType: data[0],
          value: node.value(),
        },
      ],
      { feature: 'retrieve', requestID },
    );
    if (hash.length != checkHash.length) return rejectHash(hash, requestID);
    for (const i in hash) if (hash[i] !== checkHash[i]) return rejectHash(hash, requestID);
    void log(() => ['Passed hash validation', { hash: base58.encode(hash) }], {
      feature: 'retrieve',
      requestID,
    });
    return node;
  };
}

function rejectHash(hash: Uint8Array, requestID: number) {
  void error(() => ['Failed hash validation', { hash: base58.encode(hash) }], {
    feature: 'retrieve',
    requestID,
  });
}
