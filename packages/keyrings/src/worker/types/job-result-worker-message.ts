import { WorkerMessageType, type WorkerMessage } from './message';
import type { Action, Result } from './request';

export type JobResultWorkerMessage<T extends Action = Action> =
  WorkerMessage<WorkerMessageType.RESULT> & { jobID: number } & Result<T>;
