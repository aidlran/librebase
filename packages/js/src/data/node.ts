import { derived, signal, tick, type SignalGetter, type SignalSetter } from '@adamantjs/signals';
import { format, type MediaType } from 'content-type';
import type { ChannelModule, RetrievedNodeData, SerializedNodeData } from '../channel';
import { HashAlgorithm } from '../crypto/hash';
import type { Serializers } from './data.module';
import { dataHash } from './data-hash';
import { mediaTypeSignal } from './media-type-signal';

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

export function chainedNodeSetter<T>(this: [Node, SignalSetter<T>], value: T) {
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
  const [channels, serializers] = this;

  const node = {} as Node;

  node.push = pushNode.bind([node, channels]);

  const [hashAlg, setHashAlg] = signal<HashAlgorithm>(HashAlgorithm.SHA256);
  node.hashAlg = hashAlg;
  node.setHashAlg = chainedNodeSetter.bind<(alg: HashAlgorithm) => Node>([node, setHashAlg]);

  const [mediaType, setMediaType] = mediaTypeSignal(node);
  node.mediaType = mediaType;
  node.setMediaType = setMediaType;

  const [value, setValue] = signal<unknown>(undefined) as [<T>() => T, SignalSetter<unknown>];
  node.value = value;
  node.setValue = chainedNodeSetter.bind([node, setValue]);

  const payload = derived(calculateNodePayload.bind([value, mediaType, serializers]));
  node.payload = payload;
  node.setPayload = setPayload.bind([node, serializers]);

  node.hash = derived(calculateNodeHash.bind([payload, hashAlg]));

  return node;
}

export async function getNode(
  this: [ChannelModule, (data: RetrievedNodeData, hash: Uint8Array) => Promise<Node | void>],
  hash: Uint8Array,
) {
  const [channels, parseSerializedNode] = this;
  return channels.getNode(hash, (data) => parseSerializedNode(data, hash));
}

export async function parseSerializedNode(
  this: [createNode: () => Node],
  data: RetrievedNodeData,
  hash: Uint8Array,
) {
  const [createNode] = this;
  const [mediaType, payload] = data;
  const node = createNode().setHashAlg(hash[0]).setMediaType(mediaType).setPayload(payload);
  await tick();
  const checkHash = await node.hash();
  if (hash.length !== checkHash.length) return;
  for (const i in hash) if (hash[i] !== checkHash[i]) return;
  // TODO: parse the wrapped data and return an extended Node API with verriden
  // if (node.mediaType().type !== 'application/lb-data') return node;
  return node;
}
