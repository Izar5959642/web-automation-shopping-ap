import { TraceStep } from '../domain/Trace';

/**
 * Collects automation trace steps for a single request.
 * Wraps async operations, measures execution time, and records
 * success/failure for each named step.
 *
 * Usage:
 *   const collector = new TraceCollector();
 *   await collector.record(requestId, 'SCRAPE', () => service.search(query));
 *   res.json({ trace: collector.getSteps() });
 */
export class TraceCollector {
  private steps: TraceStep[] = [];

  /**
   * Executes fn, records a TraceStep with timing and status.
   * Re-throws any error after recording it as a failed step.
   * TODO: implement
   */
  async record(requestId: string, step: string, fn: () => Promise<void>): Promise<void> {
    const timestamp = new Date().toISOString();
    const start = Date.now();
    try {
      await fn();
      const traceStep: TraceStep = { requestId, step, status: 'done', durationMs: Date.now() - start, timestamp, error: null };
      this.steps.push(traceStep);
      console.log(JSON.stringify(traceStep));
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const traceStep: TraceStep = { requestId, step, status: 'failed', durationMs: Date.now() - start, timestamp, error };
      this.steps.push(traceStep);
      console.log(JSON.stringify(traceStep));
      throw err;
    }
  }

  /**
   * Returns a copy of all recorded steps.
   */
  getSteps(): TraceStep[] {
    return [...this.steps];
  }
}
