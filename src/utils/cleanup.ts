type CleanupTask = () => Promise<void> | void;

/**
 * Collects async cleanup callbacks and runs them in reverse order (LIFO).
 * Useful for API resources created during a test when the backend supports delete.
 */
export class CleanupRegistry {
  private readonly tasks: CleanupTask[] = [];

  add(task: CleanupTask): void {
    this.tasks.push(task);
  }

  async runAll(): Promise<void> {
    const errors: unknown[] = [];

    while (this.tasks.length > 0) {
      const task = this.tasks.pop();
      if (!task) {
        continue;
      }

      try {
        await task();
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Cleanup failed with ${errors.length} error(s): ${errors
          .map((error) => (error instanceof Error ? error.message : String(error)))
          .join(' | ')}`,
      );
    }
  }
}
