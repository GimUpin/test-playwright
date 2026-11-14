export interface CurlRequestInput {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

function escapeShellSingleQuotes(value: string): string {
  return value.replace(/'/g, `'\\''`);
}

function stringifyBody(body: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

/**
 * Builds a copy-pasteable curl command from an HTTP request.
 * Includes real headers/body used for the call (for debugging / Postman import).
 */
export function buildCurlCommand(input: CurlRequestInput): string {
  const lines: string[] = [`curl --location --request ${input.method.toUpperCase()} '${input.url}'`];

  for (const [key, value] of Object.entries(input.headers ?? {})) {
    lines.push(`  --header '${escapeShellSingleQuotes(`${key}: ${value}`)}'`);
  }

  const body = stringifyBody(input.body);
  if (body !== undefined && input.method.toUpperCase() !== 'GET') {
    lines.push(`  --data-raw '${escapeShellSingleQuotes(body)}'`);
  }

  return lines.join(' \\\n');
}

/**
 * Curl with sensitive header values masked (safe to share in chat).
 */
export function buildMaskedCurlCommand(
  input: CurlRequestInput,
  maskHeaders: string[] = ['client-signature', 'authorization', 'Authorization'],
): string {
  const headers = { ...(input.headers ?? {}) };
  for (const key of Object.keys(headers)) {
    if (maskHeaders.some((item) => item.toLowerCase() === key.toLowerCase())) {
      headers[key] = '***MASKED***';
    }
  }
  return buildCurlCommand({ ...input, headers });
}
