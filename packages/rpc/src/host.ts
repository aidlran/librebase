// prettier-ignore
export interface RPCHost {
  postToAll<Res, Req = unknown>(operation: string, request: Req, instanceID?: string): Promise<Res[]>;
  postToOne<Res, Req = unknown>(operation: string, request: Req, instanceID?: string): Promise<Res>;
}

export let host: RPCHost;

export function setHost(rpcHost: RPCHost) {
  host = rpcHost;
}
