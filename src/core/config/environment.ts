import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

const EnvironmentNameSchema = z.enum(['dev', 'sit', 'uat', 'prod']);

const EnvironmentSchema = z.object({
  ENV: EnvironmentNameSchema.default('dev'),
  API_TIMEOUT: z.coerce.number().int().positive().default(30_000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  /** PGW gateway base, e.g. https://core-aff.dev.accesstrade.me/pgw-api */
  CORE_PGW_URL: z.string().url(),

  /** client-id used in HMAC stringToSign */
  CLIENT_ID: z.string().min(1),
  /** secretKey used for HMAC-SHA256 (never log this) */
  CLIENT_SECRET: z.string().min(1),

  RUN_BANKGW_API_TESTS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export type EnvironmentName = z.infer<typeof EnvironmentNameSchema>;
export type AppEnvironment = z.infer<typeof EnvironmentSchema>;

let cachedEnvironment: AppEnvironment | undefined;

function resolveEnvFile(envName: string): string | undefined {
  const candidates = [
    resolve(process.cwd(), 'config', 'environments', `.env.${envName}`),
    resolve(process.cwd(), 'config', 'environments', '.env'),
    resolve(process.cwd(), `.env.${envName}`),
    resolve(process.cwd(), '.env'),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

function loadEnvironmentFiles(): void {
  const envName = (process.env.ENV ?? 'dev').toLowerCase();
  const envFile = resolveEnvFile(envName);

  if (envFile) {
    loadDotenv({ path: envFile, override: false });
  }
}

export function getEnvironment(): AppEnvironment {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  loadEnvironmentFiles();

  const parsed = EnvironmentSchema.safeParse({
    ENV: process.env.ENV,
    API_TIMEOUT: process.env.API_TIMEOUT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CORE_PGW_URL: process.env.CORE_PGW_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    RUN_BANKGW_API_TESTS: process.env.RUN_BANKGW_API_TESTS,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid environment configuration.\n${details}\n` +
        'Run `npm run prepare:env` and fill config/environments/.env*',
    );
  }

  cachedEnvironment = parsed.data;
  return cachedEnvironment;
}

export function resetEnvironmentCache(): void {
  cachedEnvironment = undefined;
}

/** Always route BankGW through PGW: {CORE_PGW_URL}/bankgw-service */
export function getBankGwBaseUrl(): string {
  const env = getEnvironment();
  return `${env.CORE_PGW_URL.replace(/\/$/, '')}/bankgw-service`;
}
