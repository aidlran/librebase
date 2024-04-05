/* eslint-disable no-console */

// TODO: push a message to worker to update setting there too

const enabledLogFeatures = new Set<LogFeature>();
export type LogFeature = 'all' | 'codec' | 'retrieve' | 'wrap' | 'write';

/** Log levels from least to most verbose. */
const logLevels = ['none', 'error', 'warn', 'log', 'all'] as const;
const enabledLogLevels = new Set<LogLevel>();
export type LogLevel = (typeof logLevels)[number];

setLogLevel('warn');

export function setLogLevel(desiredLevel: LogLevel) {
  enabledLogLevels.clear();
  for (const level of logLevels) {
    enabledLogLevels.add(level);
    if (desiredLevel === level) {
      return;
    }
  }
}

export function setLogFeatureEnabled(desiredFeature: LogFeature, enabled: boolean) {
  enabledLogFeatures[enabled ? 'add' : 'delete'](desiredFeature);
  void log(() => [
    desiredFeature,
    `logging is ${enabledLogFeatures.has(desiredFeature) ? 'en' : 'dis'}abled`,
  ]);
}

let requestIndex = 0;

export function getRequestID() {
  return requestIndex++;
}

export interface LogConfig {
  feature?: LogFeature;
  level?: LogLevel;
  requestID?: number;
}

export type MessageGetter = () => unknown[] | Promise<unknown[]>;

export function error(getMessages: MessageGetter, config?: LogConfig) {
  return processLog('error', getMessages, config);
}

export function log(getMessages: MessageGetter, config?: LogConfig) {
  return processLog('log', getMessages, config);
}

export function warn(getMessages: MessageGetter, config?: LogConfig) {
  return processLog('warn', getMessages, config);
}

function buildLogString(config: LogConfig) {
  let s = `${config.level}: Librebase:`;
  if (config.feature) s += ` ${config.feature}:`;
  if (config.requestID) s += ` Req ${config.requestID}:`;
  return s;
}

function processLog(
  defaultLevel: 'error' | 'log' | 'warn',
  getMessages: MessageGetter,
  config?: LogConfig,
) {
  const level = config?.level ?? defaultLevel;
  const feature = config?.feature;

  const hasLevel = enabledLogLevels.has('all') || enabledLogLevels.has(level);
  const hasFeature = !feature || enabledLogFeatures.has('all') || enabledLogFeatures.has(feature);

  if (!hasFeature || !hasLevel) return;

  return Promise.resolve(getMessages()).then((messages) => {
    (config ??= {}).level ??= level;
    console[defaultLevel](buildLogString(config), ...messages);
  });
}
