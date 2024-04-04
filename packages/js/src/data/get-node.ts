import { tick, type Signal, signal } from '@adamantjs/signals';
import { base58, getMultipleEncodings } from '../buffer';
import type { RetrievedNodeData } from '../channel';
import { raceChannels } from '../channel/race';
import { error, getRequestID, log } from '../logger/logger';
import type { Injector } from '../modules/modules';
import { createNode, type Node } from './create-node';

function validNodeCache(): Record<string, Node> {
  return {};
}

function addressedCache(): Record<string, Signal<Node>> {
  return {};
}

export function getNode(this: Injector) {
  return async (hash: string | Uint8Array, requestID = getRequestID()) => {
    const { raw, base58 } = getMultipleEncodings(
      hash,
      typeof hash === 'string' ? 'base58' : 'raw',
      ['base58'],
    );

    void log(() => ['Requested', { hash: base58 }], {
      feature: 'retrieve',
      requestID,
    });

    const cache = this(validNodeCache);
    const cached = cache[base58];
    if (cached) {
      void log(() => ['Found in cache', { hash: base58 }], { feature: 'retrieve', requestID });
      return cached;
    }

    const result = await this(raceChannels)(
      (channel) => channel.getNode(raw),
      (data) => this(parseSerializedNode)(data, raw, requestID),
    );

    if (result) {
      cache[base58] = result;
      void log(() => ['Added to cache', { hash: base58 }], { feature: 'retrieve', requestID });
    }

    void log(() => [result ? 'Retrieved' : 'Not found', { hash: base58 }], {
      feature: 'retrieve',
      requestID,
    });

    return result;
  };
}

export function getAddressedNode(this: Injector) {
  return async (address: string | Uint8Array, requestID = getRequestID()) => {
    const { raw, base58 } = getMultipleEncodings(
      address,
      typeof address === 'string' ? 'base58' : 'raw',
      ['base58'],
    );

    void log(() => ['Requested', { address: base58 }], {
      feature: 'retrieve',
      requestID,
    });

    const cache = this(addressedCache);
    const cached = cache[base58]?.[0]();
    if (cached) {
      void log(() => ['Found in cache', { address: base58 }], { feature: 'retrieve', requestID });
      return cached;
    }

    const result = await this(raceChannels)(
      (channel) => channel.getAddressedNodeHash(raw),
      (hash) => this(getNode)(hash, requestID),
    );

    if (result) {
      cache[base58] = signal(result);
      void log(() => ['Added to cache', { address: base58 }], { feature: 'retrieve', requestID });
    }

    void log(() => [result ? 'Retrieved' : 'Not found', { address: base58 }], {
      feature: 'retrieve',
      requestID,
    });

    return result;
  };
}

export function parseSerializedNode(this: Injector) {
  return async (data: RetrievedNodeData, hash: Uint8Array, requestID?: number) => {
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

function rejectHash(hash: Uint8Array, requestID?: number) {
  void error(() => ['Failed hash validation', { hash: base58.encode(hash) }], {
    feature: 'retrieve',
    requestID,
  });
}
