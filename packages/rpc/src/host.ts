export interface RPCHost {
  postToAll(operation: string, request: unknown, instanceID?: string): Promise<unknown[]>;
  postToOne(operation: string, request: unknown, instanceID?: string): Promise<unknown>;
}

export let host: RPCHost;

export function setHost(rpcHost: RPCHost) {
  host = rpcHost;
}
