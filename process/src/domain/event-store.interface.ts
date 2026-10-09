import type { StoredEvent } from './telemetry-event.interface';

export interface EventStore {
  save(event: StoredEvent): Promise<void>;
}

export const EVENT_STORE = Symbol('EVENT_STORE');

export interface EventCache {
  append(event: StoredEvent): Promise<void>;
}

export const EVENT_CACHE = Symbol('EVENT_CACHE');
