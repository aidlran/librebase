import { derived, signal, tick } from '@adamantjs/signals';
import { format, parse, type MediaType } from 'content-type';
import type { SerializedNodeData } from '../channel';
import { channelSet } from '../channel/channel-set';
import { getCodec } from '../codec/get';
import { HashAlgorithm, hash } from '../hash';
import { mediaTypeSignal } from './media-type-signal';
import type { Injector } from '../modules/modules';
import { isWrap } from '../wrap/is-wrap';
import type { WrapConfig, WrapValue } from '../wrap/types';
import { unwrap as unwrapFn } from '../wrap/unwrap';
import { wrap } from '../wrap/wrap';

export interface Node {
  hashAlg(): HashAlgorithm;
  setHashAlg(alg: HashAlgorithm): Node;
  mediaType(): MediaType;
  setMediaType(type: string | MediaType): Node;
  value<T>(): T;
  setValue(value: unknown): Node;
  payload(): Promise<Uint8Array>;
  setPayload(payload: Uint8Array): Promise<Node>;
  popWrapper(): void;
  pushWrapper(config: WrapConfig): Node;
  hash(): Promise<Uint8Array>;
  push(): Promise<Node>;
}

export function createNode(this: Injector) {
  return () => {
    const wrappers = new Array<WrapConfig>();
    const [hashAlg, setHashAlg] = signal<HashAlgorithm>(HashAlgorithm.SHA256);
    const [value, setValue] = signal<unknown>(undefined);
    const node = { hashAlg, value } as Node;
    node.setHashAlg = chainedSetter.bind<(v: HashAlgorithm) => Node>([node, setHashAlg]);
    node.setValue = chainedSetter.bind<(v: unknown) => Node>([node, setValue]);
    const [mediaType, setMediaType] = mediaTypeSignal(node);
    node.mediaType = mediaType;
    node.setMediaType = setMediaType;
    node.payload = derived(calculatePayload.bind([node, wrappers, this]));
    node.setPayload = setPayload.bind([node, wrappers, this]);
    node.popWrapper = popWrapper.bind([node, wrappers]);
    node.pushWrapper = pushWrapper.bind([node, wrappers]);
    node.hash = derived(calculateHash.bind(node));
    node.push = pushNode.bind([node, wrappers, this]);
    return node;
  };
}

function chainedSetter<T, R>(this: [R, (v: T) => void], value: T) {
  const [chainedReturn, set] = this;
  set(value);
  return chainedReturn;
}

async function calculatePayload(this: [Node, WrapConfig[], Injector]) {
  const [node, wrapConfigs, inject] = this;
  const mediaType = node.mediaType();
  function serialize(mediaType: MediaType, value: unknown) {
    return inject(getCodec)(mediaType.type).encode(value, mediaType);
  }
  if (wrapConfigs.length) {
    const wrapValues = new Array<WrapValue>();

    for (let i = 0; i < wrapConfigs.length; i++) {
      const first = i == 0;
      const wrappedMediaType = first ? mediaType : { type: 'application/json' };
      const value = first ? node.value() : wrapValues[i - 1];
      const wrappedPayload = serialize(wrappedMediaType, value);
      const wrapValue = (await inject(wrap)(wrapConfigs[i], wrappedPayload)) as WrapValue;
      wrapValues.push(wrapValue);
      wrapValue.mediaType = format(wrappedMediaType);
    }

    const final = wrapValues.pop()!;
    return serialize({ type: 'application/json' }, final);
  } else {
    return serialize(mediaType, node.value());
  }
}

function calculateHash(this: Node) {
  return this.payload()
    .then((payload) => hash(this.hashAlg(), payload))
    .then((hash) => hash.toBytes());
}

async function setPayload(this: [Node, WrapConfig[], Injector], payload: Uint8Array) {
  const [node, wrappers, inject] = this;
  const unwrap = inject(unwrapFn);

  wrappers.length = 0;
  let mediaType = node.mediaType();
  let currentPayload = payload;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const serializer = inject(getCodec)(mediaType.type);
    const value = serializer.decode(currentPayload, mediaType);

    if (isWrap(value)) {
      const [payload, config] = await unwrap(value as WrapValue);
      currentPayload = payload;
      mediaType = parse((value as WrapValue).mediaType);
      wrappers.push(config);
    } else {
      return node.setMediaType(mediaType).setValue(value);
    }
  }
}

async function pushNode(this: [Node, WrapConfig[], Injector]) {
  const [node, wrappers, inject] = this;
  await tick();
  const data: SerializedNodeData = {
    hash: await node.hash(),
    mediaType: wrappers.length ? 'application/json' : format(node.mediaType()),
    payload: await node.payload(),
  };
  await Promise.all([...inject(channelSet)].map((channel) => channel.putNode(data)));
  return this[0];
}

function popWrapper(this: [Node, WrapConfig[]]) {
  const [node, configs] = this;
  configs.pop();
  return node;
}

function pushWrapper(this: [Node, WrapConfig[]], config: WrapConfig) {
  const [node, configs] = this;
  configs.push(config);
  return node;
}
