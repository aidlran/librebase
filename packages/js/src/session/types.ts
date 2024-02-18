import type { Signal } from '@adamantjs/signals';
import type { Session as DBSession } from '../indexeddb/indexeddb.js';

/** @deprecated */
export interface Session<T = unknown>
  extends Omit<DBSession<T>, 'id' | 'salt' | 'nonce' | 'payload'> {
  id: number;
  active: boolean;
}

/** @deprecated */
export interface ActiveSession<T = unknown> extends Session<T> {
  active: true;
}

/** @deprecated */
export interface InactiveSession<T = unknown> extends Session<T> {
  active: false;
}

/** @deprecated */
export type AllSessions<T = unknown> = Partial<Record<number, Session<T>>>;

/** @deprecated */
export type ActiveSessionSignal<T = unknown> = Signal<ActiveSession<T> | undefined>;

/** @deprecated */
export type AllSessionsSignal<T = unknown> = Signal<AllSessions<T>>;
