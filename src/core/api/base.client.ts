import { test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { getEnvironment } from '../config/environment';
import { attachApiCallToReport } from '../../utils/api-report';
import { buildCurlCommand, buildMaskedCurlCommand } from '../../utils/curl-builder';
import { formatHttpDebugDump } from '../../utils/http-debug-formatter';
import { logger, maskSensitiveData } from '../../utils/logger';
import { parseJsonResponse, type ParsedApiResponse } from './api-response';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: QueryParams;
  timeout?: number;
  /**
   * When false, skip request/response body logging (still logs method/url/status).
   */
  logBody?: boolean;
}

function isPlaywrightTestContext(): boolean {
  try {
    test.info();
    return true;
  } catch {
    return false;
  }
}

export class BaseClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
    protected readonly defaultHeaders: Record<string, string> = {},
  ) {}

  async get<T = unknown>(path: string, options?: RequestOptions): Promise<ParsedApiResponse<T>> {
    return this.send<T>('GET', path, undefined, options);
  }

  async post<T = unknown>(
    path: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<ParsedApiResponse<T>> {
    return this.send<T>('POST', path, data, options);
  }

  async put<T = unknown>(
    path: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<ParsedApiResponse<T>> {
    return this.send<T>('PUT', path, data, options);
  }

  async patch<T = unknown>(
    path: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<ParsedApiResponse<T>> {
    return this.send<T>('PATCH', path, data, options);
  }

  async delete<T = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<ParsedApiResponse<T>> {
    return this.send<T>('DELETE', path, undefined, options);
  }

  protected buildUrl(path: string, params?: QueryParams): string {
    const normalizedBase = this.baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${normalizedBase}${normalizedPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
          continue;
        }
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  private async send<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    data?: unknown,
    options: RequestOptions = {},
  ): Promise<ParsedApiResponse<T>> {
    const execute = async (): Promise<ParsedApiResponse<T>> => {
      const env = getEnvironment();
      const url = this.buildUrl(path, options.params);
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...options.headers,
      };
      const timeout = options.timeout ?? env.API_TIMEOUT;
      const startedAt = Date.now();
      const logBody = options.logBody !== false;

      const curlMasked = buildMaskedCurlCommand({ method, url, headers, body: data });
      const curlFull = buildCurlCommand({ method, url, headers, body: data });

      logger.info(`API ${method} ${url}`, {
        headers: maskSensitiveData(headers),
        body: logBody ? maskSensitiveData(data) : undefined,
        curl: curlMasked,
      });
      logger.debug(`API curl (full)\n${curlFull}`);

      let response: APIResponse;
      try {
        response = await this.request.fetch(url, {
          method,
          headers,
          data,
          timeout,
          failOnStatusCode: false,
        });
      } catch (error) {
        logger.error(`API ${method} ${url} failed to communicate`, {
          error: error instanceof Error ? error.message : String(error),
          curl: curlMasked,
        });
        throw error;
      }

      const parsed = await parseJsonResponse<T>(response);
      const durationMs = Date.now() - startedAt;

      const debugDump = formatHttpDebugDump({
        method,
        url,
        requestHeaders: headers,
        requestBody: logBody ? data : undefined,
        responseStatus: parsed.status,
        responseHeaders: parsed.headers,
        responseBody: logBody ? parsed.body : undefined,
        durationMs,
        maskSecrets: true,
      });

      logger.info(`API ${method} ${url} -> status_code=${parsed.status} (${durationMs}ms)\n${debugDump}`);

      await attachApiCallToReport({
        method,
        url,
        headers,
        requestBody: logBody ? data : undefined,
        responseStatus: parsed.status,
        responseHeaders: parsed.headers,
        responseBody: logBody ? parsed.body : undefined,
        durationMs,
      });

      return parsed;
    };

    if (isPlaywrightTestContext()) {
      return test.step(`API ${method} ${path}`, execute);
    }

    return execute();
  }
}
