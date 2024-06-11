interface Base {
  id: ArrayBuffer;
  instanceID?: string;
}

export type WorkerDeleteMessage = Base & { op: 'del' };
export type WorkerGetMessage = Base & { op: 'get' };
export type WorkerPutMessage = Base & { op: 'put'; val: ArrayBuffer };

export type WorkerMessage = WorkerDeleteMessage | WorkerGetMessage | WorkerPutMessage;
