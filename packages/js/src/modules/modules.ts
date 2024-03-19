export type Constructor = (this: Injector) => unknown;
export type Injector = <T extends Constructor>(module: T) => ReturnType<T>;

const currentDependencies = new Set<Constructor>();
const instances: Record<string, Map<Constructor, ReturnType<Constructor>>> = {};
const injectors: Record<string, Injector> = {};

function injector<T extends Constructor>(this: string, module: T): ReturnType<T> {
  if (instances[this]?.get(module)) {
    return instances[this].get(module) as ReturnType<T>;
  }
  instances[this] ??= new Map();
  const instance = module.bind(injectors[this])();
  instances[this].set(module, instance);
  return instance as ReturnType<T>;
}

export function getModule<T extends Constructor>(module: T, instanceID = '') {
  if (currentDependencies.has(module)) {
    throw new Error('Circular dependency detected');
  }
  currentDependencies.add(module);
  injectors[instanceID] ??= injector.bind(instanceID) as Injector;
  const instance = injectors[instanceID](module);
  currentDependencies.delete(module);
  return instance;
}
