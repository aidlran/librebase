/* eslint-disable no-console */

/** Log levels from least to most verbose. */
export const logLevels = ['none', 'error', 'warn', 'log', 'all'] as const;
const enabledLogLevels = new Set<LogLevel>();
export type LogLevel = (typeof logLevels)[number];

export function setLogLevel(desiredLevel: LogLevel) {
  enabledLogLevels.clear();
  for (const level of logLevels) {
    enabledLogLevels.add(level);
    if (desiredLevel === level) {
      return;
    }
  }
  void log(() => [`Log level set to ${desiredLevel}`]);
}

export async function log(
  messages: () => unknown[] | Promise<unknown[]>,
  level: Exclude<LogLevel, 'all'> = 'log',
) {
  if (!enabledLogLevels.has('all') || !enabledLogLevels.has(level)) {
    return;
  }
  const logFn = level === 'warn' || level === 'error' ? console[level] : console.log;
  logFn(`${level}: Librebase:`, ...(await Promise.resolve(messages())));
}

setLogLevel('warn');
