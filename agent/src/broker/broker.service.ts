import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import type {
  EventBroker,
  EventListener,
} from '../domain/event-broker.interface';
import type { TelemetryEvent } from '../domain/telemetry-event.interface';

function encodeTelemetryEvent(event: TelemetryEvent): string {
  return `{"name":${JSON.stringify(event.name)},"value":${event.value}}`;
}

/**
 * صف داخل حافظه. رویداد روی دیسک نوشته نمی‌شود.
 * هر رویداد یک بار به متن تبدیل می‌شود و همان متن به وب و سوکت داده می‌شود.
 * اگر شنونده‌ای عقب بماند، آن رویداد دور ریخته می‌شود تا تولید متوقف نشود.
 */
@Injectable()
export class BrokerService implements EventBroker {
  private readonly capacity: number;
  private readonly buffer: Array<TelemetryEvent | undefined>;
  private readonly listeners = new Set<EventListener>();
  private writeIndex = 0;
  private count = 0;
  private published = 0;
  private dropped = 0;
  private listenerErrors = 0;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.capacity = config.eventBufferSize;
    this.buffer = new Array<TelemetryEvent | undefined>(this.capacity);
  }

  get publishedCount(): number {
    return this.published;
  }

  get subscriberCount(): number {
    return this.listeners.size;
  }

  get bufferedCount(): number {
    return this.count;
  }

  get droppedCount(): number {
    return this.dropped;
  }

  get listenerErrorCount(): number {
    return this.listenerErrors;
  }

  publish(event: TelemetryEvent): void {
    const stored: TelemetryEvent = Object.freeze({
      name: event.name,
      value: event.value,
    });
    this.buffer[this.writeIndex] = stored;
    this.writeIndex += 1;
    if (this.writeIndex === this.capacity) {
      this.writeIndex = 0;
    }
    if (this.count < this.capacity) {
      this.count += 1;
    }
    this.published += 1;
    if (this.listeners.size === 0) {
      return;
    }

    const encoded = encodeTelemetryEvent(stored);
    for (const listener of this.listeners) {
      try {
        listener(stored, encoded);
      } catch {
        this.listenerErrors += 1;
      }
    }
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    let active = true;
    return () => {
      if (!active) {
        return;
      }
      active = false;
      this.listeners.delete(listener);
    };
  }

  recent(
    limit: number,
    names?: ReadonlySet<string> | null,
  ): readonly TelemetryEvent[] {
    if (limit <= 0 || this.count === 0) {
      return [];
    }
    if (!names || names.size === 0) {
      return this.sliceRecent(Math.min(limit, this.count));
    }

    const matched: TelemetryEvent[] = [];
    let index = this.writeIndex - 1;
    if (index < 0) {
      index = this.capacity - 1;
    }
    for (let seen = 0; seen < this.count && matched.length < limit; seen += 1) {
      const event = this.buffer[index];
      if (event && names.has(event.name)) {
        matched.push(event);
      }
      index -= 1;
      if (index < 0) {
        index = this.capacity - 1;
      }
    }
    matched.reverse();
    return matched;
  }

  recordDrop(count = 1): void {
    this.dropped += count;
  }

  private sliceRecent(size: number): TelemetryEvent[] {
    const events = new Array<TelemetryEvent>(size);
    let index = this.writeIndex - size;
    if (index < 0) {
      index += this.capacity;
    }
    for (let i = 0; i < size; i += 1) {
      events[i] = this.buffer[index] as TelemetryEvent;
      index += 1;
      if (index === this.capacity) {
        index = 0;
      }
    }
    return events;
  }
}
