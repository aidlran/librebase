import type { MaybePromise } from '../../core/channels.js';
import type { RequestMessage, ResponseMessage } from '../types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestHandler<Req = any, Res = any> = (
  request: Req,
  instanceID?: string,
) => MaybePromise<Res>;

/**
 * A `Map` instance of request handlers mapped to their request type. You can use this to register
 * request handlers when this process is used as an RPC server.
 *
 * The following snippet will register a handler for the `speak` request type. Whenever a `speak`
 * type request comes in, this handler is used to process the request and get the response, which in
 * this case is `Hello!`.
 *
 *     const requestType = 'speak';
 *
 *     const handler = (request, instanceID) => {
 *       return 'Hello!';
 *     };
 *
 *     Handlers.set(requestType, handler);
 */
export const Handlers = new Map<string, RequestHandler>();

function createError(request: RequestMessage, error?: string): ResponseMessage {
  const { instanceID, jobID, op } = request;
  return {
    error,
    instanceID,
    jobID,
    ok: false,
    op,
  };
}

export async function processRequest(request: RequestMessage): Promise<ResponseMessage> {
  const handler = Handlers.get(request.op);
  if (!handler) {
    return createError(request, 'Unknown request type');
  }
  try {
    // eslint-disable-next-line
    var payload = await Promise.resolve(handler(request.payload, request.instanceID));
  } catch (e) {
    return createError(request, e instanceof Error ? e.message : undefined);
  }
  const { instanceID, jobID, op } = request;
  return {
    instanceID,
    jobID,
    ok: true,
    op,
    payload,
  };
}
