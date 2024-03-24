import { derived, signal, tick } from '@adamantjs/signals';
import { format, type MediaType } from 'content-type';
import type { SerializedNodeData } from '../channel';
import { channelSet } from '../channel/channel-set';
import { HashAlgorithm, hash } from '../crypto/hash';
import { mediaTypeSignal } from './media-type-signal';
import type { Injector } from '../modules/modules';
import { getSerializer } from '../seralizer/get';
import { jobWorker } from '../worker/worker.module';
import { WrapType } from '../wrap/enum';
import type { WrapConfig, WrapValue } from '../wrap/types';
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
    node.setPayload = setPayload.bind([node, this]);
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
    return inject(getSerializer)(mediaType.type).serialize(value, mediaType);
  }
  if (wrapConfigs.length) {
    const wrapValues = new Array<WrapValue>();

    for (let i = 0; i < wrapConfigs.length; i++) {
      const first = i == 0;
      const wrappedMediaType = first ? mediaType : { type: 'application/lb-wrap' };
      const value = first ? node.value() : wrapValues[i - 1];
      const wrappedPayload = serialize(wrappedMediaType, value);
      const wrapValue = (await inject(wrap)(wrapConfigs[i], wrappedPayload)) as WrapValue;
      wrapValues.push(wrapValue);
      wrapValue.mediaType = format(wrappedMediaType);
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

async function setPayload(this: [Node, Injector], payload: Uint8Array) {
  const [node, inject] = this;
  const mediaType = node.mediaType();
  const serializer = inject(getSerializer)(mediaType.type);
  const value = serializer.deserialize(payload, mediaType);
  if (mediaType.type !== 'application/lb-wrap') {
    return node.setValue(value);
  }

  let currentPayload = payload;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const wrapValue = value as WrapValue;

    // TODO: move wrap processing to own function

    switch (wrapValue.type) {
      case WrapType.ECDSA: {
        node.pushWrapper({
          hashAlg: wrapValue.hash[0],
          metadata: wrapValue.metadata.publicKey,
          type: wrapValue.type,
        });
        currentPayload = wrapValue.payload;
        const validateHash = await hash(wrapValue.hash[0], currentPayload);
        const valid = await new Promise<boolean>((resolve) => {
          inject(jobWorker).postToOne(
            {
              action: 'verify',
              payload: {
                hash: new Uint8Array(validateHash),
                ...wrapValue.metadata,
              },
            },
            ({ payload }) => resolve(payload),
          );
        });
        if (!valid) {
          throw new Error('Invalid signature');
        }
      }
    }

    if (wrapValue.mediaType !== 'application/lb-wrap') {
      node.setMediaType(wrapValue.mediaType);
      node.setValue(
        inject(getSerializer)(node.mediaType().type).deserialize(currentPayload, node.mediaType()),
      );
      return node;
    }
  }
}

async function pushNode(this: [Node, WrapConfig[], Injector]) {
  const [node, wrappers, inject] = this;
  await tick();
  const data: SerializedNodeData = {
    hash: await node.hash(),
    mediaType: wrappers.length ? 'application/lb-wrap' : format(node.mediaType()),
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
