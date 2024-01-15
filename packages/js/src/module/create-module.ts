const DEPENDENCIES = new Set();

export function createModule<T>(constructor: (key: string) => T): (key?: string) => T {
  const INSTANCES: Record<string, T> = {};
  return (key = ''): T => {
    if (DEPENDENCIES.has(constructor)) {
      throw new Error('Circular dependency detected');
    }
    DEPENDENCIES.add(constructor);
    if (!INSTANCES[key]) {
      INSTANCES[key] = constructor(key);
    }
    DEPENDENCIES.delete(constructor);
    return INSTANCES[key];
  };
}
