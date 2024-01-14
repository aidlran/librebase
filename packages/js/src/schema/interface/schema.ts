import type { Node } from '../../node/class/node.js';

export type Schema<T> = () => Node<T>;
