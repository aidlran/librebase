// prettier-ignore
export const WebWorkerStrategy = () => new Worker(new URL('../../worker/entrypoint?worker', import.meta.url), {
  type: 'module',
});
