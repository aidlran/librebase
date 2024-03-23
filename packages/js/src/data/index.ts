import { getModule } from '../modules/modules';
import { createNode as createNodeFn } from './create-node';
import { getNode as getNodeFn } from './get-node';

export type { Node, WrapperConfig } from './create-node';

export function createNode(instanceID?: string) {
  return getModule(createNodeFn, instanceID)();
}

export function getNode(hash: Uint8Array, instanceID?: string) {
  return getModule(getNodeFn, instanceID)(hash);
}
