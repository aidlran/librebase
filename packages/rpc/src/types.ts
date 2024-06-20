export type MessageEventListenerMethod<T> = (
  type: 'message',
  listener: (event: { data: T }) => void,
) => unknown;

// Message Configs

export type MessageConfig<T extends string = string> = Record<
  T,
  [request: unknown, response: unknown]
>;

export type OperationsOf<T extends MessageConfig> = Extract<keyof T, string>;

// Messages

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
