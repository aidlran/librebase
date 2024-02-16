import {
  createDerived,
  createSignal,
  type SignalGetter,
  type SignalSetter,
} from '@adamantjs/signals';
import type { ChannelDriver, SerializedNodeData } from '../channel/types';
import { HashType, sha256, type Hash } from '../crypto/hash';

export interface Node {
  hashAlg: SignalGetter<HashType>;
  setHashAlg: (alg: HashType) => Node;

  mediaType: SignalGetter<string>;
  setMediaType: (type: string) => Node;

  value: <T>() => T;
  setValue: <T>(value: T) => Node;

  payload: SignalGetter<Uint8Array>;
  hash: SignalGetter<Promise<Hash>>;

  push: () => Promise<Node>;
}

function calculateNodePayload(this: [SignalGetter<unknown>, SignalGetter<string>]) {
  const [value] = this;
  if (!(value instanceof Uint8Array)) {
    throw new TypeError('Invalid node value type');
  }
  return value() as Uint8Array;
}

function calculateNodeHash(this: [SignalGetter<Uint8Array>, SignalGetter<HashType>]) {
  const [payload, hashAlg] = this;
  switch (hashAlg()) {
    case HashType.SHA256:
      return sha256(payload());
    default:
      throw new TypeError('Unsupported hashAlg');
  }
}

function chainedSetter<T>(this: [Node, SignalSetter<T>], value: T) {
  const [node, set] = this;
  set(value);
  return node;
}

async function pushNode(this: [Node, ChannelDriver[]]) {
  const [node, channels] = this;
  const hash = await node.hash();
  const data: SerializedNodeData = {
    hash: new Uint8Array([hash.type, ...hash.value]),
    mediaType: node.mediaType(),
    payload: node.value(),
  };
  channels.forEach((channel) => void channel.putNode(data));
  return node;
}

export function createNode(this: ChannelDriver[]): Node {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const channels = this;

  const [value, setValue] = createSignal<unknown>(undefined) as [<T>() => T, SignalSetter<unknown>];
  const [hashAlg, setHashAlg] = createSignal<HashType>(HashType.SHA256);
  const [mediaType, setMediaType] = createSignal<string>('application/octet-stream');
  const payload = createDerived(calculateNodePayload.bind([value, mediaType]));
  const hash = createDerived(calculateNodeHash.bind([payload, hashAlg]));

  const node: Node = { hash, hashAlg, mediaType, payload, value } as Node;

  node.push = pushNode.bind([node, channels]);

  node.setHashAlg = chainedSetter.bind<
    (this: [Node, SignalSetter<HashType>], alg: HashType) => Node
  >([node, setHashAlg]);

  node.setMediaType = chainedSetter.bind<
    (this: [Node, SignalSetter<string>], type: string) => Node
  >([node, setMediaType]);

  node.setValue = chainedSetter.bind([node, setValue]);

  return node;
}
