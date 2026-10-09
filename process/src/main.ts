/**
 * شروع خواندن سرویس پردازش از همین فایل است.
 * سرویس عامل باید زودتر روشن باشد.
 * این سرویس رویداد را می‌گیرد، ذخیره می‌کند و با قانون‌ها مقایسه می‌کند.
 *
 * مسیر خواندن، به ترتیب:
 * اتصال پایگاه و سرویس‌ها
 * app.module.ts
 * اتصال به سوکت سرویس عامل
 * subscriber/agent-subscriber.service.ts
 * ذخیره رویداد
 * events/event-ingest.handler.ts
 * بررسی قانون در حافظه
 * rules/rule-evaluation.handler.ts
 * ساخت و تغییر قانون
 * rules/rules.controller.ts
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_CONFIG } from './config/app-config.interface';
import type { AppConfig } from './config/app-config.interface';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();
  const config = app.get<AppConfig>(APP_CONFIG);
  await app.listen(config.port);
  const logger = new Logger('Process');
  logger.log(`listening on http://localhost:${config.port}/api`);
  logger.log(`docs at http://localhost:${config.port}/api/docs`);
  logger.log(`subscribing to ${config.agentBaseUrl}`);
}

void bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Process failed to start';
  console.error(message);
  process.exit(1);
});
