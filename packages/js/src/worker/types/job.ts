import type { Action } from './action';
import type { Request } from './request';

/** Used internally for communication to workers. */
export type Job<T extends Action> = Request<T> & { jobID: number };
