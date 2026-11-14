import { maskSensitiveData } from './logger';
import { buildCurlCommand, buildMaskedCurlCommand } from './curl-builder';

export interface HttpDebugReportInput {
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  statusCode?: number | null;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  durationMs?: number | null;
  /**
   * When true, mask signature/authorization in request headers shown in report body.
   * Curl full section still keeps real values for local replay.
   */
  maskSensitiveInText?: boolean;
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

/**
 * Human-readable API debug report for Playwright Attachments / UI Mode.
 * Includes status_code, request, response, and curl.
 */
export function buildHttpDebugReport(input: HttpDebugReportInput): string {
  const mask = input.maskSensitiveInText !== false;
  const requestHeaders = mask
    ? (maskSensitiveData(input.requestHeaders) as Record<string, string>)
    : input.requestHeaders;
  const requestBody = mask ? maskSensitiveData(input.requestBody) : input.requestBody;
  const responseHeaders = mask
    ? (maskSensitiveData(input.responseHeaders ?? {}) as Record<string, string>)
    : (input.responseHeaders ?? {});
  const responseBody = mask ? maskSensitiveData(input.responseBody) : input.responseBody;

  const statusCode =
    input.statusCode === undefined || input.statusCode === null
      ? '(not executed)'
      : String(input.statusCode);

  const duration =
    input.durationMs === undefined || input.durationMs === null
      ? '(n/a)'
      : `${input.durationMs}ms`;

  const curlFull = buildCurlCommand({
    method: input.method,
    url: input.url,
    headers: input.requestHeaders,
    body: input.requestBody,
  });

  const curlMasked = buildMaskedCurlCommand({
    method: input.method,
    url: input.url,
    headers: input.requestHeaders,
    body: input.requestBody,
  });

  return [
    '========== API DEBUG REPORT ==========',
    `method       : ${input.method.toUpperCase()}`,
    `url          : ${input.url}`,
    `status_code  : ${statusCode}`,
    `duration     : ${duration}`,
    '',
    '---------- REQUEST ----------',
    '[HEADERS]',
    pretty(requestHeaders),
    '',
    '[BODY]',
    pretty(requestBody),
    '',
    '---------- RESPONSE ----------',
    '[HEADERS]',
    input.statusCode == null ? '(no response yet)' : pretty(responseHeaders),
    '',
    '[BODY]',
    input.statusCode == null ? '(no response yet)' : pretty(responseBody),
    '',
    '---------- CURL (FULL) ----------',
    curlFull,
    '',
    '---------- CURL (MASKED) ----------',
    curlMasked,
    '',
    '====================================',
  ].join('\n');
}
