import type { TelemetryEvent } from './telemetry-event.interface';

export type EventListener = (event: TelemetryEvent, encoded: string) => void;

export interface EventBroker {
  publish(event: TelemetryEvent): void;
  subscribe(listener: EventListener): () => void;
  recent(
    limit: number,
    names?: ReadonlySet<string> | null,
  ): readonly TelemetryEvent[];
  recordDrop(count?: number): void;
  readonly publishedCount: number;
  readonly subscriberCount: number;
  readonly bufferedCount: number;
  readonly droppedCount: number;
  readonly listenerErrorCount: number;
}
