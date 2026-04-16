// Tipi minimi locali per chart components - no external deps
export type ChartDatum = Record<string, string | number | null | undefined>;
export type DatumAccessor<T extends ChartDatum = ChartDatum> = (d: T) => number;
export type KeyAccessor<T extends ChartDatum = ChartDatum> = (d: T) => string;

// Chart event handlers
export type ChartEventHandler = (event: unknown, data?: unknown) => void;

// Chart payload structure (minimal)
export type ChartPayload = {
  value?: number;
  name?: string;
  dataKey?: string;
  [key: string]: unknown;
};
