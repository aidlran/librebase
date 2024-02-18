import { getChannels } from '../channel/channel.module';
import { getDataModule } from '../data/data.module';
import { createModule } from '../module/create-module';
import { createJobWorker } from '../worker/worker.module';

export const getKeyringModule = createModule((key) => {
  const channels = getChannels(key);
  const data = getDataModule(key);
  const worker = createJobWorker();
});
