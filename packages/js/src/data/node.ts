import { derived, signal, tick, type SignalGetter, type SignalSetter } from '@adamantjs/signals';
import { format, parse, type MediaType } from 'content-type';
import type { ChannelModule, RetrievedNodeData, SerializedNodeData } from '../channel';
import { HashAlgorithm } from '../crypto/hash';
import type { Serializers } from './data.module';
import { dataHash } from './data-hash';

export interface Node {
  hashAlg: SignalGetter<HashAlgorithm>;
  setHashAlg: (alg: HashAlgorithm) => Node;

  mediaType: SignalGetter<MediaType>;
  setMediaType: (type: string | MediaType) => Node;

  payload: SignalGetter<Uint8Array>;
  setPayload: (payload: Uint8Array) => Node;

  value: <T>() => T;
  setValue: <T>(value: T) => Node;

  hash: SignalGetter<Promise<Uint8Array>>;

  push: () => Promise<Node>;
}

function calculateNodePayload(this: [() => unknown, () => MediaType, Serializers]) {
  const [value, mediaType, serializers] = this;

  const serializer = serializers[mediaType().type];

  if (serializer) {
    return serializer.serialize(value(), mediaType());
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

async function pushNode(this: [Node, ChannelModule]) {
  const [node, channels] = this;
  await tick();
  const data: SerializedNodeData = {
    hash: await node.hash(),
    mediaType: format(node.mediaType()),
    payload: node.payload(),
  };
  await channels.putNode(data);
  return node;
}

function setPayload(this: [Node, Serializers], payload: Uint8Array) {
  const [node, serializers] = this;
  const mediaType = node.mediaType();
  const serializer = serializers[mediaType.type];
  if (!serializer) throw new TypeError('Unsupported media type - no serializer available');
  return node.setValue(serializer.deserialize(payload, mediaType));
}

export function createNode(this: [ChannelModule, Serializers]): Node {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const [channels, serializers] = this;

  const [value, setValue] = signal<unknown>(undefined) as [<T>() => T, SignalSetter<unknown>];
  const [hashAlg, setHashAlg] = signal<HashAlgorithm>(HashAlgorithm.SHA256);
  const [mediaType, setMediaType] = signal<MediaType>({ type: 'application/octet-stream' });
  const payload = derived(calculateNodePayload.bind([value, mediaType, serializers]));
  const hash = derived(calculateNodeHash.bind([payload, hashAlg]));

  const node: Node = { hash, hashAlg, mediaType, payload, value } as Node;

  node.push = pushNode.bind([node, channels]);

  node.setHashAlg = chainedSetter.bind<
    (this: [Node, SignalSetter<HashAlgorithm>], alg: HashAlgorithm) => Node
  >([node, setHashAlg]);

  node.setMediaType = (mediaType: string | MediaType) => {
    setMediaType(typeof mediaType === 'string' ? parse(mediaType) : mediaType);
    return node;
  };

  node.setPayload = setPayload.bind([node, serializers]);

  node.setValue = chainedSetter.bind([node, setValue]);

  return node;
}

export async function getNode(this: [ChannelModule, () => Node], hash: Uint8Array) {
  const [channels, createNode] = this;
  return channels.getNode(hash, validateNode.bind([createNode, hash]));
}

export async function validateNode(
  this: [createNode: () => Node, hash: Uint8Array],
  data: RetrievedNodeData,
) {
  const [createNode, hash] = this;
  const [mediaType, payload] = data;
  const node = createNode().setHashAlg(hash[0]).setMediaType(mediaType).setPayload(payload);
  await tick();
  const checkHash = await node.hash();
  if (hash.length !== checkHash.length) return;
  for (const i in hash) if (hash[i] !== checkHash[i]) return;
  return node;
}
