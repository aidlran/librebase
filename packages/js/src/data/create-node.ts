import { derived, signal, tick } from '@adamantjs/signals';
import { format, type MediaType } from 'content-type';
import type { ChannelModule, SerializedNodeData } from '../channel';
import { channelModule } from '../channel/channel.module';
import { HashAlgorithm, hash, type SignatureType } from '../crypto';
import { mediaTypeSignal } from './media-type-signal';
import type { Injector } from '../modules/modules';
import { serializerMap } from '../seralizer/serializer-map';
import type { SerializerMap } from '../seralizer/types';

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
    node.payload = derived(calculatePayload.bind([value, mediaType, this(serializerMap)]));
    node.setPayload = setPayload.bind([node, this(serializerMap)]);
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
  this: [getValue: () => unknown, getMediaType: () => MediaType, SerializerMap],
) {
  const serializer = this[2][this[1]().type];
  if (serializer) {
    return serializer.serialize(this[0](), this[1]());
  }
  if (this[0]() instanceof Uint8Array) {
    return this[0]() as Uint8Array;
  }
  if (this[0]() === undefined) {
    return new Uint8Array();
  }
  throw new TypeError('Unsupported media type - no serializer available');
}

function calculateHash(this: [hashAlg: () => HashAlgorithm, payload: () => Uint8Array]) {
  return hash(this[0](), this[1]()).then((hash) => {
    return new Uint8Array([this[0](), ...new Uint8Array(hash)]);
  });
}

function setPayload(this: [Node, SerializerMap], payload: Uint8Array) {
  const mediaType = this[0].mediaType();
  const serializer = this[1][mediaType.type];
  if (!serializer) throw new TypeError('Unsupported media type - no serializer available');
  return this[0].setValue(serializer.deserialize(payload, mediaType));
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
