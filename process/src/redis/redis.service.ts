import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import type { EventCache } from '../domain/event-store.interface';
import type { StoredEvent } from '../domain/telemetry-event.interface';
import { EVENT_STREAM, RULES_CHANNEL, RULES_KEY } from './redis.constants';

type RuleListener = (payload: string) => void;

@Injectable()
export class RedisService implements EventCache, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly commands: Redis;
  private readonly subscription: Redis;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    const options = {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    };
    this.commands = new Redis(config.redisUrl, options);
    this.subscription = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
    });
    this.commands.on('error', (error: Error) =>
      this.logger.error(error.message),
    );
    this.subscription.on('error', (error: Error) =>
      this.logger.error(error.message),
    );
  }

  async append(event: StoredEvent): Promise<void> {
    await this.commands.xadd(
      EVENT_STREAM,
      'MAXLEN',
      '~',
      String(this.config.redisEventMaxLen),
      '*',
      'eventId',
      event.id,
      'agentInstanceId',
      event.agentInstanceId,
      'name',
      event.name,
      'value',
      String(event.value),
      'receivedAt',
      event.receivedAt.toISOString(),
    );
  }

  async readRules(): Promise<string | null> {
    return this.commands.get(RULES_KEY);
  }

  async publishRules(payload: string): Promise<void> {
    await this.commands
      .multi()
      .set(RULES_KEY, payload)
      .publish(RULES_CHANNEL, payload)
      .exec();
  }

  async subscribeRules(listener: RuleListener): Promise<void> {
    this.subscription.on('message', (channel: string, message: string) => {
      if (channel === RULES_CHANNEL) {
        listener(message);
      }
    });
    await this.subscription.subscribe(RULES_CHANNEL);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([this.commands.quit(), this.subscription.quit()]);
  }
}
