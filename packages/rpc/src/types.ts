export type MessageEventListenerMethod<T> = (
  type: 'message',
  listener: (event: { data: T }) => void,
) => unknown;

export interface RequestMessage<Op extends string = string, Payload = unknown> {
  instanceID?: string;
  jobID: number;
  op: Op;
  payload: Payload;
}

export type ResponseMessage<Op extends string = string, Payload = unknown> = {
  instanceID?: string;
  jobID: number;
  op: Op;
} & ({ ok: true; payload: Payload } | { ok: false; error?: string });
