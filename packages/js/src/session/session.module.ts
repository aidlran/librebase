import { createSignal } from '@adamantjs/signals';
import { createModule } from '../module/create-module.js';
import { getWorkerModule } from '../worker/worker.module.js';
import { construct as constructClear, type SessionClearFn } from './function/clear.js';
import { construct as constructCreate, type SessionCreateFn } from './function/create.js';
import { getSessions } from './function/get-sessions.js';
import { construct as constructImport, type SessionImportFn } from './function/import.js';
import { construct as constructLoad, type SessionLoadFn } from './function/load.js';
import type { ActiveSession, AllSessions } from './types.js';

export interface SessionModule<T = unknown> {
  activeSession: () => ActiveSession<T> | undefined;
  allSessions: () => AllSessions<T>;
  clear: SessionClearFn;
  create: SessionCreateFn<T>;
  getSessions(callback?: (sessions: Readonly<AllSessions>) => unknown): void;
  import: SessionImportFn<T>;
  load: SessionLoadFn<T>;
}

export const getSessionModule = createModule((key) => {
  const workerDispatch = getWorkerModule(key);

  const activeSessionSignal = createSignal<ActiveSession | undefined>(undefined);
  const [activeSession, setActiveSession] = activeSessionSignal;

  const allSessionsSignal = createSignal<AllSessions>({});
  const [allSessions] = allSessionsSignal;

  const load = constructLoad(workerDispatch, setActiveSession, allSessionsSignal);

  const SESSION_MODULE: SessionModule = {
    activeSession,
    allSessions,
    clear: constructClear(workerDispatch, activeSessionSignal, allSessionsSignal),
    create: constructCreate(workerDispatch, load, allSessionsSignal),
    import: constructImport(workerDispatch, load, allSessionsSignal),
    load,

    getSessions(callback?: (sessions: Readonly<AllSessions>) => unknown): void {
      getSessions(allSessionsSignal, () => {
        if (callback) callback(allSessions());
      });
    },
  };

  return SESSION_MODULE;
});

export const getTypedSessionModule = <T = unknown>(key?: string): SessionModule<T> => {
  return getSessionModule(key) as SessionModule<T>;
};
