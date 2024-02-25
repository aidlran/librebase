import {
  createDerived,
  createSignal,
  type SignalGetter,
  type SignalSetter,
} from '@adamantjs/signals';
import type { ChannelDriver, SerializedNodeData } from '../channel/types';
import { HashAlgorithm } from '../crypto/hash';
import type { Serializers } from './data.module';
import { dataHash } from './data-hash';

export interface Node {
  hashAlg: SignalGetter<HashAlgorithm>;
  setHashAlg: (alg: HashAlgorithm) => Node;

  mediaType: SignalGetter<string>;
  setMediaType: (type: string) => Node;

  value: <T>() => T;
  setValue: <T>(value: T) => Node;

  payload: SignalGetter<Uint8Array>;
  hash: SignalGetter<Promise<Uint8Array>>;

  push: () => Promise<Node>;
}

function calculateNodePayload(this: [SignalGetter<unknown>, SignalGetter<string>, Serializers]) {
  const [value, mediaType, serializers] = this;

  const serializer = serializers[mediaType()];

  if (serializer) {
    return serializer.serialize(value());
  }

  if (value() instanceof Uint8Array) {
    return value() as Uint8Array;
  }

  if (value() === undefined) {
    return new Uint8Array();
  }

  throw new TypeError('Unsupported media type - no serializer available');
}

function calculateNodeHash(this: [SignalGetter<Uint8Array>, SignalGetter<HashAlgorithm>]) {
  const [payload, hashAlg] = this;
  return dataHash(hashAlg(), payload());
}

function chainedSetter<T>(this: [Node, SignalSetter<T>], value: T) {
  const [node, set] = this;
  set(value);
  return node;
}

async function pushNode(this: [Node, Set<ChannelDriver>]) {
  const [node, channels] = this;
  const data: SerializedNodeData = {
    hash: await node.hash(),
    mediaType: node.mediaType(),
    payload: node.payload(),
  };
  channels.forEach((channel) => void channel.putNode(data));
  return node;
}

export function createNode(this: [Set<ChannelDriver>, Serializers]): Node {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const [channels, serializers] = this;

  const [value, setValue] = createSignal<unknown>(undefined) as [<T>() => T, SignalSetter<unknown>];
  const [hashAlg, setHashAlg] = createSignal<HashAlgorithm>(HashAlgorithm.SHA256);
  const [mediaType, setMediaType] = createSignal<string>('application/octet-stream');
  const payload = createDerived(calculateNodePayload.bind([value, mediaType, serializers]));
  const hash = createDerived(calculateNodeHash.bind([payload, hashAlg]));

  const node: Node = { hash, hashAlg, mediaType, payload, value } as Node;

  node.push = pushNode.bind([node, channels]);

  node.setHashAlg = chainedSetter.bind<
    (this: [Node, SignalSetter<HashAlgorithm>], alg: HashAlgorithm) => Node
  >([node, setHashAlg]);

  node.setMediaType = chainedSetter.bind<
    (this: [Node, SignalSetter<string>], type: string) => Node
  >([node, setMediaType]);

  node.setValue = chainedSetter.bind([node, setValue]);

  return node;
}

export function getNode(this: [Set<ChannelDriver>, () => Node], hash: Uint8Array) {
  const [channels, createNode] = this;

  // TODO(refactor): move this onto ChannelModule
  const promises = [...channels].map((channel) => {
    return Promise.resolve(channel.getNode(hash))
      .then((result) => {
        if (result) {
          const [mediaType, payload] = result;
          const node = createNode().setHashAlg(hash[0]).setMediaType(mediaType).setValue(payload);
          return node.hash().then((vHash) => {
            if (hash.length !== vHash.length) {
              return;
            }
            for (const i in hash) {
              if (hash[i] !== vHash[i]) {
                return;
              }
            }
            return node;
          });
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn(error);
      });
  });

  // TODO: this is going to return the first resolved, even if it resolves null or rejects
  return Promise.race(promises);
}
