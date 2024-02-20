import type { WorkerModule } from '../worker/worker.module';

export interface Identity {
  address: Promise<string>;
}

export function getIdentity(this: [WorkerModule['postToOne']], id: string): Identity {
  const [dispatchJob] = this;
  const address = new Promise<string>((resolve) => {
    dispatchJob({ action: 'identity.get', payload: id }, (result) => resolve(result.payload));
  });
  return { address };
}
