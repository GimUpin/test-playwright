import type { APIResponse } from '@playwright/test';
import type { ZodTypeAny, z } from 'zod';

export interface ParsedApiResponse<T> {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: T;
  raw: APIResponse;
}

export async function parseJsonResponse<T = unknown>(
  response: APIResponse,
): Promise<ParsedApiResponse<T>> {
  const status = response.status();
  const headers = response.headers();
  const text = await response.text();

  let body = undefined as unknown as T;
  if (text.length > 0) {
    try {
      body = JSON.parse(text) as T;
    } catch {
      body = text as unknown as T;
    }
  }

  return {
    status,
    ok: response.ok(),
    headers,
    body,
    raw: response,
  };
}

export function validateSchema<TSchema extends ZodTypeAny>(
  schema: TSchema,
  data: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Schema validation failed:\n${details}`);
  }
  return result.data;
}
