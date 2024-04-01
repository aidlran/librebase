/* eslint-disable no-console */

let enabled = false;

export function setLoggingEnabled(value: boolean) {
  enabled = value;
  log(`Librebase: logging is ${enabled ? 'en' : 'dis'}abled`);
}

export function error(message?: unknown, ...optionalParams: unknown[]) {
  enabled && console.error(message, ...optionalParams);
}

export function log(message?: unknown, ...optionalParams: unknown[]) {
  enabled && console.log(message, ...optionalParams);
}

export function warn(message?: unknown, ...optionalParams: unknown[]) {
  enabled && console.warn(message, ...optionalParams);
}
