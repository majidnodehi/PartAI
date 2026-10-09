import type { MetricName } from './metric-name';

export interface MetricDefinition {
  readonly name: MetricName;
  readonly min: number;
  readonly max: number;
  readonly fractionDigits: number;
}
