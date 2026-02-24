/**
 * Status of an individual automation step.
 */
export type TraceStatus = 'pending' | 'running' | 'done' | 'failed';

/**
 * Represents a single tracked step in the automation flow.
 * Used for observability — each automation action produces a TraceStep.
 */
export interface TraceStep {
  /** UUID v4 request identifier, shared across all steps in one request */
  requestId: string;

  /** Name of the automation step (e.g. "LOGIN", "EXTRACT", "CHECKOUT_COMPLETE") */
  step: string;

  /** Current status of this step */
  status: TraceStatus;

  /** Time taken to complete the step in milliseconds, null if not yet finished */
  durationMs: number | null;

  /** ISO 8601 timestamp of when the step was recorded */
  timestamp: string;

  /** Error message if the step failed, null otherwise */
  error: string | null;
}
