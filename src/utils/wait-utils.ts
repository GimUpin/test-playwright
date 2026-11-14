export interface PollOptions {
  timeoutMs?: number;
  intervalMs?: number;
  errorMessage?: string;
}

/**
 * Polls until the condition resolves to a truthy value or timeout is reached.
 * Prefer Playwright auto-waiting for UI. Use this for eventual-consistency API checks.
 */
export async function pollUntil<T>(
  condition: () => Promise<T | null | undefined | false>,
  options: PollOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const intervalMs = options.intervalMs ?? 500;
  const deadline = Date.now() + timeoutMs;

  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const result = await condition();
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }

    await delay(intervalMs);
  }

  const suffix = lastError instanceof Error ? ` Last error: ${lastError.message}` : '';
  throw new Error(
    `${options.errorMessage ?? `Condition not met within ${timeoutMs}ms.`}${suffix}`,
  );
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
