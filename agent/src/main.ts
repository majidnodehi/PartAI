/**
 * شروع خواندن سرویس عامل از همین فایل است.
 * این سرویس فقط رویداد می‌سازد و پخش می‌کند.
 * هر رویداد دو فیلد دارد: نام و مقدار.
 * قانون هشدار اینجا بررسی نمی‌شود. سرویس پردازش آن را بررسی می‌کند.
 *
 * مسیر خواندن، به ترتیب:
 * اتصال سرویس‌ها به یکدیگر
 * app.module.ts
 * ساخت رویداد
 * publisher/publisher.service.ts
 * پخش رویداد به شنونده‌ها
 * broker/broker.service.ts
 * تحویل رویداد از راه وب
 * transport/events.controller.ts
 * تحویل رویداد از راه سوکت
 * transport/events.gateway.ts
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = configureApp(app);
  app.enableShutdownHooks();
  await app.listen(config.port);
  const logger = new Logger('Agent');
  logger.log(
    `instance ${config.instanceId} is publishing ${config.eventCount} events every ${config.intervalSeconds}s`,
  );
  logger.log(`http://localhost:${config.port}/api/diagnostics`);
  logger.log(`ws://localhost:${config.port}${config.wsPath}`);
}

void bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Agent failed to start';
  console.error(message);
  process.exit(1);
});
