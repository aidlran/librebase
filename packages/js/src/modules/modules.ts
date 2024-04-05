export type Constructor = (this: Injector) => unknown;
export type Injector = (<T extends Constructor>(module: T) => ReturnType<T>) & {
  instanceID: string;
};

const currentDependencies = new Set<Constructor>();
const injectors: Record<string, Injector> = {};
const instances: Record<string, Map<Constructor, unknown>> = {};

export function getModule<T extends Constructor>(module: T, instanceID = '') {
  if (currentDependencies.has(module)) {
    throw new Error('Circular dependency detected');
  }
  currentDependencies.add(module);
  let instance = (instances[instanceID] ??= new Map()).get(module);
  if (!instance) {
    if (!injectors[instanceID]) {
      injectors[instanceID] = inject.bind<Omit<Injector, 'instanceID'>>(instanceID) as Injector;
      injectors[instanceID].instanceID ??= instanceID;
    }
    const injector = injectors[instanceID];
    instance = module.bind(injector)();
    instances[instanceID].set(module, instance);
  }
  currentDependencies.delete(module);
  return instance as ReturnType<T>;
}

function inject<T extends Constructor>(this: string, module: T): ReturnType<T> {
  return getModule(module, this);
}
