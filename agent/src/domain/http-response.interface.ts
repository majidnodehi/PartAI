import type { TelemetryEvent } from './telemetry-event.interface';

export interface DiagnosticsResponse {
  readonly instanceId: string;
  readonly uptimeMs: number;
  readonly port: number;
  readonly wsPath: string;
  readonly eventCount: number;
  readonly intervalSeconds: number;
  readonly published: number;
  readonly subscribers: number;
  readonly buffered: number;
  readonly bufferCapacity: number;
  readonly dropped: number;
  readonly listenerErrors: number;
  readonly metrics: readonly string[];
}

export interface RecentEventsResponse {
  readonly instanceId: string;
  readonly events: readonly TelemetryEvent[];
}
