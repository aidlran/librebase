const queued = new Set<() => void>();

/**
 * Like `queueMicrotask` except if the task has already been queued with this method and has not yet
 * executed, it will not be added to the queue again.
 */
export const queueUniqueMicrotask = (callback: () => void): void => {
  if (queued.has(callback)) return;
  queued.add(callback);
  queueMicrotask(() => {
    callback();
    queued.delete(callback);
  });
};
