/* eslint-disable no-console */

// TODO: push a message to worker to update setting there too

export const enabledLogFeatures = new Set<LogFeature>();
export type LogFeature = 'all';

/** Log levels from least to most verbose. */
const logLevels = ['none', 'error', 'warn', 'log', 'all'] as const;
export const enabledLogLevels = new Set<LogLevel>();
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

export function setlogFeatureEnabled(desiredFeature: LogFeature, enabled: boolean) {
  enabledLogFeatures[enabled ? 'add' : 'delete'](desiredFeature);
  log(
    undefined,
    desiredFeature,
    `logging is ${enabledLogFeatures.has(desiredFeature) ? 'en' : 'dis'}abled`,
  );
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

function buildLogString(config: LogConfig) {
  let s = `${config.level}: Librebase:`;
  if (config.feature) s += ` ${config.feature}:`;
  if (config.requestID) s += ` Req ${config.requestID}:`;
  return s;
}

function processLog(
  defaultLevel: 'error' | 'log' | 'warn',
  config?: LogConfig,
  ...messages: unknown[]
) {
  const level = config?.level ?? defaultLevel;
  if (enabledLogLevels.has('all') || enabledLogLevels.has(level)) {
    (config ??= {}).level ??= level;
    console[defaultLevel](buildLogString(config), ...messages);
  }
}

export function error(config?: LogConfig, ...messages: unknown[]) {
  processLog('error', config, ...messages);
}

export function log(config?: LogConfig, ...messages: unknown[]) {
  processLog('log', config, ...messages);
}

export function warn(config?: LogConfig, ...messages: unknown[]) {
  processLog('warn', config, ...messages);
}
