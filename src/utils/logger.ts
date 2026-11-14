import { getEnvironment } from '../core/config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEYS = [
  'password',
  'token',
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'authorization',
  'Authorization',
  'secret',
  'apiKey',
  'api_key',
  'signature',
  'CLIENT_SECRET',
  'client_secret',
];

function shouldLog(level: LogLevel): boolean {
  const configured = getEnvironment().LOG_LEVEL;
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configured];
}

function maskValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
    return '***MASKED***';
  }
  return value;
}

export function maskSensitiveData<T>(payload: T): T {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => maskSensitiveData(item)) as T;
  }

  if (typeof payload === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      result[key] =
        typeof value === 'object' && value !== null ? maskSensitiveData(value) : maskValue(key, value);
    }
    return result as T;
  }

  return payload;
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const maskedMeta = meta === undefined ? undefined : maskSensitiveData(meta);

  if (maskedMeta === undefined) {
    // eslint-disable-next-line no-console
    console.log(`${prefix} ${message}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`${prefix} ${message}`, maskedMeta);
}

export const logger = {
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};
