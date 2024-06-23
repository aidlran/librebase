// prettier-ignore
export interface RPCClient {
  postToAll<Res, Req = unknown>(operation: string, request: Req, instanceID?: string): Promise<Res[]>;
  postToOne<Res, Req = unknown>(operation: string, request: Req, instanceID?: string): Promise<Res>;
}

export let client: RPCClient;

export function setClient(rpcClient: RPCClient) {
  client = rpcClient;
}
