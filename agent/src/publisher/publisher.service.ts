import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { BrokerService } from '../broker/broker.service';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import { MetricGeneratorService } from '../metrics/metric-generator.service';

/**
 * موتور تولید رویداد.
 * تعداد رویداد و طول بازه زمانی از تنظیم‌ها می‌آید و فاصله هر تیک از تقسیم آن دو به دست می‌آید.
 * هر تیک یک نمونه عددی می‌گیرد و به پخش‌کننده می‌دهد.
 */
@Injectable()
export class PublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PublisherService.name);
  private readonly intervalMs: number;
  private readonly statsEvery: number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sinceStats = 0;
  private started = false;

  constructor(
    private readonly broker: BrokerService,
    private readonly generator: MetricGeneratorService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {
    this.intervalMs = Math.max(
      1,
      Math.round((config.intervalSeconds * 1000) / config.eventCount),
    );
    this.statsEvery =
      config.logEverySeconds <= 0
        ? 0
        : Math.max(
            1,
            Math.round(
              (config.eventCount / config.intervalSeconds) *
                config.logEverySeconds,
            ),
          );
  }

  async onModuleInit(): Promise<void> {
    await this.generator.whenReady();
    this.start();
  }

  onModuleDestroy(): void {
    this.started = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.arm();
  }

  private arm(): void {
    this.timer = setTimeout(() => {
      if (!this.started) {
        return;
      }
      this.publishOne();
      this.arm();
    }, this.intervalMs);
  }

  private publishOne(): void {
    this.broker.publish(this.generator.next());
    if (this.statsEvery === 0) {
      return;
    }
    this.sinceStats += 1;
    if (this.sinceStats < this.statsEvery) {
      return;
    }
    this.sinceStats = 0;
    this.logger.log(
      `instance ${this.config.instanceId} published ${this.broker.publishedCount} events to ${this.broker.subscriberCount} subscribers`,
    );
  }
}
