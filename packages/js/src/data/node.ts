import {
  createDerived,
  createSignal,
  tick,
  type SignalGetter,
  type SignalSetter,
} from '@adamantjs/signals';
import type { ChannelModule } from '../channel/channel.module';
import type { ChannelDriver, SerializedNodeData } from '../channel/types';
import { HashAlgorithm } from '../crypto/hash';
import type { Serializers } from './data.module';
import { dataHash } from './data-hash';

export interface Node {
  hashAlg: SignalGetter<HashAlgorithm>;
  setHashAlg: (alg: HashAlgorithm) => Node;

  mediaType: SignalGetter<string>;
  setMediaType: (type: string) => Node;

  payload: SignalGetter<Uint8Array>;
  setPayload: (payload: Uint8Array) => Node;

  value: <T>() => T;
  setValue: <T>(value: T) => Node;

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

function setPayload(this: [Node, Serializers], payload: Uint8Array) {
  const [node, serializers] = this;
  const mediaType = node.mediaType();
  const serializer = serializers[mediaType];
  if (!serializer) throw new TypeError('Unsupported media type - no serializer available');
  return node.setValue(serializer.deserialize(payload));
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

  node.setPayload = setPayload.bind([node, serializers]);

  node.setValue = chainedSetter.bind([node, setValue]);

  return node;
}

export async function getNode(this: [ChannelModule, () => Node], hash: Uint8Array) {
  const [channels, createNode] = this;
  const result = await channels.getNode(hash);
  if (!result) return;
  const [mediaType, payload] = result;
  const node = createNode().setHashAlg(hash[0]).setMediaType(mediaType).setPayload(payload);
  await tick();
  // TODO(fix): do this per channel
  const checkHash = await node.hash();
  if (hash.length !== checkHash.length) return;
  for (const i in hash) if (hash[i] !== checkHash[i]) return;
  return node;
}
