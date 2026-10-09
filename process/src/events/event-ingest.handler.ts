import { Inject, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { EVENT_CACHE, EVENT_STORE } from '../domain/event-store.interface';
import type { EventCache, EventStore } from '../domain/event-store.interface';
import type {
  AgentEvent,
  StoredEvent,
} from '../domain/telemetry-event.interface';
import { RuleEvaluationHandler } from '../rules/rule-evaluation.handler';

/**
 * هر رویداد دریافتی از اینجا رد می‌شود.
 * اول در پایگاه داده ذخیره می‌شود.
 * اگر نوشتن در حافظه سریع خطا بدهد، رویداد حذف نمی‌شود.
 * بعد از ذخیره، قانون‌ها روی همین رویداد بررسی می‌شوند.
 */
@Injectable()
export class EventIngestHandler {
  private readonly logger = new Logger(EventIngestHandler.name);

  constructor(
    @Inject(EVENT_STORE) private readonly events: EventStore,
    @Inject(EVENT_CACHE) private readonly cache: EventCache,
    private readonly evaluation: RuleEvaluationHandler,
  ) {}

  async handle(
    event: AgentEvent,
    agentInstanceId: string,
  ): Promise<StoredEvent> {
    const stored: StoredEvent = {
      id: new Types.ObjectId().toHexString(),
      agentInstanceId,
      name: event.name,
      value: event.value,
      receivedAt: new Date(),
    };
    await this.events.save(stored);
    try {
      await this.cache.append(stored);
    } catch (error: unknown) {
      this.logger.error(
        error instanceof Error ? error.message : 'Redis event write failed',
      );
    }
    await this.evaluation.handle(stored);
    return stored;
  }
}
