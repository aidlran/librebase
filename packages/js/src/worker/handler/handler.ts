import type { WorkerDataRequest, WorkerDataResponse } from '../types';
import { WorkerDataRequestType, WorkerMessageType } from '../types';

export function handleMessage(
  this: Worker,
  { data: [messageType, requestType, ..._params] }: MessageEvent<WorkerDataRequest>,
) {
  const response: Partial<WorkerDataResponse> = [messageType, requestType];

  if (
    messageType === WorkerMessageType.DATA &&
    requestType === WorkerDataRequestType.GET_ROOT_NODE
  ) {
    this.postMessage(response);
  }
}
