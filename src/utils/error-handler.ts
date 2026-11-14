export class FrameworkError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'FrameworkError';
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function rethrowWithContext(context: string, error: unknown): never {
  throw new FrameworkError(`${context}: ${toErrorMessage(error)}`, error);
}
