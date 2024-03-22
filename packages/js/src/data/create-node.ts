import { derived, signal, tick } from '@adamantjs/signals';
import { format, type MediaType } from 'content-type';
import type { ChannelModule, SerializedNodeData } from '../channel';
import { channelModule } from '../channel/channel.module';
import { HashAlgorithm, hash, type SignatureType } from '../crypto';
import { mediaTypeSignal } from './media-type-signal';
import type { Injector } from '../modules/modules';
import type { Serializer } from '../seralizer/types';
import { getSerializer } from '../seralizer/get';

export interface Node {
  hashAlg: () => HashAlgorithm;
  setHashAlg: (alg: HashAlgorithm) => Node;
  mediaType: () => MediaType;
  setMediaType: (type: string | MediaType) => Node;
  value: <T>() => T;
  setValue: (value: unknown) => Node;
  payload: () => Uint8Array;
  setPayload: (payload: Uint8Array) => Node;
  addWrapper: (config: WrapperConfig) => Node;
  hash: () => Promise<Uint8Array>;
  push: () => Promise<Node>;
}

export interface WrapperConfig {
  hashAlg?: HashAlgorithm;
  type: SignatureType;
  metadata: unknown;
}

export function createNode(this: Injector) {
  return () => {
    const wrappers = new Array<WrapperConfig>();
    const [hashAlg, setHashAlg] = signal<HashAlgorithm>(HashAlgorithm.SHA256);
    const [value, setValue] = signal<unknown>(undefined);
    const node = { hashAlg, value } as Node;
    node.setHashAlg = chainedSetter.bind<(v: HashAlgorithm) => Node>([node, setHashAlg]);
    node.setValue = chainedSetter.bind<(v: unknown) => Node>([node, setValue]);
    const [mediaType, setMediaType] = mediaTypeSignal(node);
    node.mediaType = mediaType;
    node.setMediaType = setMediaType;
    node.payload = derived(calculatePayload.bind([value, mediaType, this(getSerializer)]));
    node.setPayload = setPayload.bind([node, this(getSerializer)]);
    node.hash = derived(calculateHash.bind([hashAlg, node.payload]));
    node.push = pushNode.bind([node, this(channelModule)]);
    node.addWrapper = addWrapper.bind([node, wrappers]);
    return node;
  };
}

function chainedSetter<T, R>(this: [chainedReturn: R, setter: (v: T) => void], value: T) {
  this[1](value);
  return this[0];
}

function calculatePayload(
  this: [getValue: () => unknown, getMediaType: () => MediaType, (mediaType: string) => Serializer],
) {
  const [value, mediaType, getSerializer] = this;
  return getSerializer(mediaType().type).serialize(value(), mediaType());
}

function calculateHash(this: [hashAlg: () => HashAlgorithm, payload: () => Uint8Array]) {
  return hash(this[0](), this[1]()).then((hash) => {
    return new Uint8Array([this[0](), ...new Uint8Array(hash)]);
  });
}

function setPayload(this: [Node, (mediaType: string) => Serializer], payload: Uint8Array) {
  const [node, getSerializer] = this;
  const mediaType = node.mediaType();
  const serializer = getSerializer(mediaType.type);
  return node.setValue(serializer.deserialize(payload, mediaType));
}

async function pushNode(this: [Node, ChannelModule]) {
  await tick();
  const data: SerializedNodeData = {
    hash: await this[0].hash(),
    mediaType: format(this[0].mediaType()),
    payload: this[0].payload(),
  };
  await this[1].putNode(data);
  return this[0];
}

function addWrapper(this: [Node, WrapperConfig[]], config: WrapperConfig) {
  this[1].push(config);
  return this[0];
}
