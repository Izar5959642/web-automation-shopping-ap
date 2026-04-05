import React from 'react';
import { TraceStep } from '../../domain/Trace';

interface TraceStepListProps {
  steps: TraceStep[];
}

export function TraceStepList({ steps }: TraceStepListProps): React.ReactElement | null {
  if (steps.length === 0) return null;

  return (
    <div style={{ textAlign: 'left', marginBottom: 24, border: '1px solid var(--color-border)', padding: 16 }}>
      <h3 style={{ marginBottom: 12, fontFamily: 'var(--font-serif)', fontWeight: 300 }}>Automation Steps</h3>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontFamily: 'var(--font-sans)' }}>
          <span>{step.status === 'done' ? '✅' : '❌'} {step.step}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{step.durationMs}ms{step.error ? ` — ${step.error}` : ''}</span>
        </div>
      ))}
    </div>
  );
}
