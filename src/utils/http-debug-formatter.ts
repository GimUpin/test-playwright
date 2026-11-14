import { maskSensitiveData } from './logger';
import { buildCurlCommand, buildMaskedCurlCommand } from './curl-builder';

export interface HttpDebugInput {
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  durationMs?: number;
  /**
   * When true, mask signature/authorization in headers + curl.
   * Use false only for local debug artifacts that must be replayable.
   */
  maskSecrets?: boolean;
}

function pretty(value: unknown): string {
  if (value === undefined) {
    return '(none)';
  }
  if (typeof value === 'string') {
    return value.length > 0 ? value : '(empty string)';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatHeaders(headers: Record<string, string> | undefined): string {
  if (!headers || Object.keys(headers).length === 0) {
    return '(none)';
  }
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

/**
 * Builds a single human-readable dump:
 * status_code + request + response + curl
 */
export function formatHttpDebugDump(input: HttpDebugInput): string {
  const maskSecrets = input.maskSecrets !== false;
  const requestHeaders = maskSecrets
    ? (maskSensitiveData(input.requestHeaders) as Record<string, string>)
    : input.requestHeaders;
  const responseHeaders = input.responseHeaders
    ? maskSecrets
      ? (maskSensitiveData(input.responseHeaders) as Record<string, string>)
      : input.responseHeaders
    : undefined;
  const requestBody = maskSecrets ? maskSensitiveData(input.requestBody) : input.requestBody;
  const responseBody = maskSecrets ? maskSensitiveData(input.responseBody) : input.responseBody;

  const curl = (maskSecrets ? buildMaskedCurlCommand : buildCurlCommand)({
    method: input.method,
    url: input.url,
    headers: input.requestHeaders,
    body: input.requestBody,
  });

  const statusLine =
    input.responseStatus === undefined
      ? 'status_code: (not executed yet)'
      : `status_code: ${input.responseStatus}`;

  const durationLine =
    input.durationMs === undefined ? 'duration_ms: (n/a)' : `duration_ms: ${input.durationMs}`;

  return [
    '========== API DEBUG DUMP ==========',
    `method: ${input.method.toUpperCase()}`,
    `url: ${input.url}`,
    statusLine,
    durationLine,
    '',
    '---------- REQUEST ----------',
    '[headers]',
    formatHeaders(requestHeaders),
    '',
    '[body]',
    pretty(requestBody),
    '',
    '---------- RESPONSE ----------',
    '[headers]',
    formatHeaders(responseHeaders),
    '',
    '[body]',
    pretty(responseBody),
    '',
    '---------- CURL ----------',
    curl,
    '',
    '========== END ==========',
  ].join('\n');
}
