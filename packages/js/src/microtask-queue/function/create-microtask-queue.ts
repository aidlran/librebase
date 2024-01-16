export const createMicrotaskQueue = <T extends () => void>() => {
  const queue = new Set<T>();

  const processQueue = () => {
    queue.forEach((item) => item());
    queue.clear();
  };

  return (item: T) => {
    if (!queue.size) {
      queueMicrotask(processQueue);
    }
    queue.add(item);
  };
};
