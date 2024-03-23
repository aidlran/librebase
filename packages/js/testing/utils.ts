export function resolveBeforeTimeout(promise: Promise<unknown>, timeout: number) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timed out'));
      }, timeout);
    }),
  ]);
}
