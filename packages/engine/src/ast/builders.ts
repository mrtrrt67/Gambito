import type { NodeId } from './types';

let _counter = 0;

/** Genera un NodeId univoco, deterministico per test (reset con resetCounter). */
export function makeId(): NodeId {
  return `n${(_counter++).toString(36).padStart(4, '0')}`;
}

/** Resetta il contatore — usare SOLO nei test, mai in produzione. */
export function resetIdCounter(): void {
  _counter = 0;
}
