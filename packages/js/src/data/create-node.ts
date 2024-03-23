import { derived, signal, tick } from '@adamantjs/signals';
import { format, type MediaType } from 'content-type';
import type { SerializedNodeData } from '../channel';
import { channelSet } from '../channel/channel-set';
import { HashAlgorithm, hash, SignatureType } from '../crypto';
import { mediaTypeSignal } from './media-type-signal';
import type { Injector } from '../modules/modules';
import { getSerializer } from '../seralizer/get';
import { jobWorker } from '../worker/worker.module';
import type { WrapValue, WrapValueUnion } from './types';

export interface Node {
  hashAlg(): HashAlgorithm;
  setHashAlg(alg: HashAlgorithm): Node;
  mediaType(): MediaType;
  setMediaType(type: string | MediaType): Node;
  value<T>(): T;
  setValue(value: unknown): Node;
  payload(): Promise<Uint8Array>;
  setPayload(payload: Uint8Array): Node;
  popWrapper(): void;
  pushWrapper(config: WrapConfig): Node;
  hash(): Promise<Uint8Array>;
  push(): Promise<Node>;
}

export type WrapConfig = {
  hashAlg?: HashAlgorithm;
  type: SignatureType;
} & WrapValueUnion;

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
    node.setPayload = setPayload.bind([node, this]);
    node.popWrapper = popWrapper.bind([node, wrappers]);
    node.pushWrapper = pushWrapper.bind([node, wrappers]);
    node.hash = derived(calculateHash.bind(node));
    node.push = pushNode.bind([node, () => !!wrappers.length, this]);
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
    return inject(getSerializer)(mediaType.type).serialize(value, mediaType);
  }
  if (wrapConfigs.length) {
    const wrapValues = new Array<WrapValue>();

    for (let i = 0; i < wrapConfigs.length; i++) {
      const { metadata, type } = wrapConfigs[i];

      if (!Object.values(SignatureType).includes(type)) {
        throw new Error('Unsupported wrap type');
      }

      const first = i == 0;
      const wrappedMediaType = first ? mediaType : { type: 'application/lb-wrap' };
      const value = first ? node.value() : wrapValues[i - 1];
      const wrappedPayload = serialize(wrappedMediaType, value);
      const hashAlg = wrapConfigs[i].hashAlg ?? HashAlgorithm.SHA256;
      const wrappedPayloadHash = await hash(hashAlg, wrappedPayload).then(
        (hash) => new Uint8Array([hashAlg, ...new Uint8Array(hash)]),
      );

      let payload: Uint8Array;

      switch (type) {
        case SignatureType.ECDSA: {
          payload = await new Promise((resolve) => {
            inject(jobWorker).postToOne(
              { action: 'sign', payload: { publicKey: metadata, hash: wrappedPayloadHash } },
              ({ payload }) => resolve(payload),
            );
          });
        }
      }

      wrapValues.push({
        mediaType: format(wrappedMediaType),
        metadata,
        type,
        payload,
        hash: wrappedPayloadHash,
      });
    }

    const final = wrapValues.pop()!;
    return serialize({ type: 'application/lb-wrap' }, final);
  } else {
    return serialize(mediaType, node.value());
  }
}

function calculateHash(this: Node) {
  const algorithm = this.hashAlg();
  return this.payload()
    .then((payload) => hash(algorithm, payload))
    .then((hash) => {
      return new Uint8Array([algorithm, ...new Uint8Array(hash)]);
    });
}

function setPayload(this: [Node, Injector], payload: Uint8Array) {
  const [node, inject] = this;
  const mediaType = node.mediaType();
  if (mediaType.type === 'application/lb-wrap') {
    throw new Error('Not implemented'); // TODO
  } else {
    const serializer = inject(getSerializer)(mediaType.type);
    return node.setValue(serializer.deserialize(payload, mediaType));
  }
}

async function pushNode(this: [Node, () => boolean, Injector]) {
  const [node, isWrapped, inject] = this;
  await tick();
  const data: SerializedNodeData = {
    hash: await node.hash(),
    mediaType: isWrapped() ? 'application/lb-wrap' : format(node.mediaType()),
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
