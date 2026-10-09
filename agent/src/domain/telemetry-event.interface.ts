import type { MetricName } from './metric-name';

export interface TelemetryEvent {
  readonly name: MetricName;
  readonly value: number;
}
