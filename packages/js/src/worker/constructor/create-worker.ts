export function createWorker() {
  return new Worker(new URL('../entrypoint/job-worker?worker', import.meta.url), {
    type: 'module',
  });
}
