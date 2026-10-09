import type { MetricDefinition } from '../domain/metric-definition.interface';

export interface AppConfig {
  readonly instanceId: string;
  readonly port: number;
  readonly eventCount: number;
  readonly intervalSeconds: number;
  readonly eventBufferSize: number;
  readonly wsPath: string;
  readonly metrics: readonly MetricDefinition[];
  readonly logEverySeconds: number;
  readonly maxBufferedBytes: number;
}

export const APP_CONFIG = Symbol('APP_CONFIG');
