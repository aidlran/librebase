import type { Session as DBSession } from '../indexeddb/indexeddb.js';
import type { WritableSignal } from '../signal/function/create-signal.js';

export interface Session<T = unknown>
  extends Omit<DBSession<T>, 'id' | 'salt' | 'nonce' | 'payload'> {
  id: number;
  active: boolean;
}

export interface ActiveSession<T = unknown> extends Session<T> {
  active: true;
}

export interface InactiveSession<T = unknown> extends Session<T> {
  active: false;
}

export type AllSessions<T = unknown> = Partial<Record<number, Session<T>>>;

export type ActiveSessionSignal<T = unknown> = WritableSignal<ActiveSession<T> | undefined>;
export type AllSessionsSignal<T = unknown> = WritableSignal<AllSessions<T>>;
