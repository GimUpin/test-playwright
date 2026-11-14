import { test } from '@playwright/test';
import { maskSensitiveData } from './logger';
import { buildCurlCommand, buildMaskedCurlCommand } from './curl-builder';
import { formatHttpDebugDump } from './http-debug-formatter';

export interface ApiCallReportInput {
  method: string;
  url: string;
  headers: Record<string, string>;
  requestBody?: unknown;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  durationMs: number;
}

function canUseTestInfo(): boolean {
  try {
    test.info();
    return true;
  } catch {
    return false;
  }
}

/**
 * Attaches API call details + curl into Playwright UI Mode / HTML report.
 * Primary file includes status_code + request + response + curl.
 */
export async function attachApiCallToReport(input: ApiCallReportInput): Promise<void> {
  if (!canUseTestInfo()) {
    return;
  }

  const info = test.info();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = `api-${input.method.toLowerCase()}-${input.responseStatus}-${stamp}`;

  const summary = {
    status_code: input.responseStatus,
    method: input.method,
    url: input.url,
    durationMs: input.durationMs,
    request: {
      headers: maskSensitiveData(input.headers),
      body: maskSensitiveData(input.requestBody),
    },
    response: {
      status_code: input.responseStatus,
      headers: maskSensitiveData(input.responseHeaders),
      body: maskSensitiveData(input.responseBody),
    },
  };

  const dumpMasked = formatHttpDebugDump({
    method: input.method,
    url: input.url,
    requestHeaders: input.headers,
    requestBody: input.requestBody,
    responseStatus: input.responseStatus,
    responseHeaders: input.responseHeaders,
    responseBody: input.responseBody,
    durationMs: input.durationMs,
    maskSecrets: true,
  });

  const dumpFull = formatHttpDebugDump({
    method: input.method,
    url: input.url,
    requestHeaders: input.headers,
    requestBody: input.requestBody,
    responseStatus: input.responseStatus,
    responseHeaders: input.responseHeaders,
    responseBody: input.responseBody,
    durationMs: input.durationMs,
    maskSecrets: false,
  });

  const curlFull = buildCurlCommand({
    method: input.method,
    url: input.url,
    headers: input.headers,
    body: input.requestBody,
  });

  const curlMasked = buildMaskedCurlCommand({
    method: input.method,
    url: input.url,
    headers: input.headers,
    body: input.requestBody,
  });

  // Main artifact for testers in UI Mode
  await info.attach(`${prefix}.full.txt`, {
    body: Buffer.from(dumpFull, 'utf8'),
    contentType: 'text/plain',
  });

  await info.attach(`${prefix}.masked.txt`, {
    body: Buffer.from(dumpMasked, 'utf8'),
    contentType: 'text/plain',
  });

  await info.attach(`${prefix}-summary.json`, {
    body: Buffer.from(JSON.stringify(summary, null, 2), 'utf8'),
    contentType: 'application/json',
  });

  await info.attach(`${prefix}.curl.txt`, {
    body: Buffer.from(curlFull, 'utf8'),
    contentType: 'text/plain',
  });

  await info.attach(`${prefix}.curl.masked.txt`, {
    body: Buffer.from(curlMasked, 'utf8'),
    contentType: 'text/plain',
  });

  info.annotations.push({
    type: 'api-call',
    description: `${input.method} ${input.url} -> status_code=${input.responseStatus} (${input.durationMs}ms)`,
  });
}
