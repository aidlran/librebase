import type { CreateSessionRequest, CreateSessionResult } from '../../../worker/types';
import type { WorkerModule } from '../../../worker/worker.module';

export async function createKeyring<T>(
  this: [WorkerModule['postToOne']],
  options: CreateSessionRequest<T>,
) {
  const [postToOne] = this;
  return new Promise<CreateSessionResult>((resolve) => {
    postToOne({ action: 'session.create', payload: options }, ({ payload }) => resolve(payload));
  });
}
