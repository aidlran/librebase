import { createSignal } from '@adamantjs/signals';
import { createModule } from '../module/create-module.js';
import { workerModule } from '../worker/worker.module.js';
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
  const workerDispatch = workerModule(key);

  const activeSession = createSignal<ActiveSession | undefined>(undefined);
  const [getActiveSession, setActiveSession] = activeSession;

  const allSessions = createSignal<AllSessions>({});
  const [getAllSessions] = allSessions;

  const load = constructLoad(workerDispatch, setActiveSession, allSessions);

  const SESSION_MODULE: SessionModule = {
    activeSession: getActiveSession,
    allSessions: getAllSessions,
    clear: constructClear(workerDispatch, activeSession, allSessions),
    create: constructCreate(workerDispatch, load, allSessions),
    import: constructImport(workerDispatch, load, allSessions),
    load,

    getSessions(callback?: (sessions: Readonly<AllSessions>) => unknown): void {
      getSessions(allSessions, () => {
        if (callback) callback(getAllSessions());
      });
    },
  };

  return SESSION_MODULE;
});

export const getTypedSessionModule = <T = unknown>(key?: string): SessionModule<T> => {
  return getSessionModule(key) as SessionModule<T>;
};
