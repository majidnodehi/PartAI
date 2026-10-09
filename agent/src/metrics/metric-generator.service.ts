import { Inject, Injectable } from '@nestjs/common';
import type { Faker } from '@faker-js/faker';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import type { MetricDefinition } from '../domain/metric-definition.interface';
import type { TelemetryEvent } from '../domain/telemetry-event.interface';

let fakerPromise: Promise<Faker> | undefined;

function loadFaker(): Promise<Faker> {
  fakerPromise ??= import('@faker-js/faker').then((module) => module.faker);
  return fakerPromise;
}

/**
 * مقدار عددی می‌سازد.
 * نام سنجه از فهرست ثابت می‌آید و فقط عدد، در بازه همان سنجه، ساخته می‌شود.
 * کتابخانه ساخت داده یک بار، پیش از شروع زمان‌سنج، بارگذاری می‌شود.
 */
@Injectable()
export class MetricGeneratorService {
  private readonly metrics: readonly MetricDefinition[];
  private faker: Faker | undefined;
  private cursor = 0;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.metrics = config.metrics;
  }

  // @faker-js/faker is ESM-only. Load it once so each sample stays synchronous.
  whenReady(): Promise<void> {
    return loadFaker().then((faker) => {
      this.faker = faker;
    });
  }

  next(): TelemetryEvent {
    const faker = this.faker;
    if (!faker) {
      throw new Error('Metric generator is not ready.');
    }
    const metric = this.metrics[this.cursor];
    this.cursor += 1;
    if (this.cursor === this.metrics.length) {
      this.cursor = 0;
    }
    return {
      name: metric.name,
      value: faker.number.float({
        min: metric.min,
        max: metric.max,
        fractionDigits: metric.fractionDigits,
      }),
    };
  }
}
