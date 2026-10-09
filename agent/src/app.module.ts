/**
 * نقشه سرویس عامل.
 * تنظیم‌ها از فایل محیط خوانده می‌شود.
 * app-config.module.ts
 * زمان‌بندی و ساخت رویداد اینجاست.
 * publisher.module.ts
 * خروجی وب و سوکت اینجاست.
 * transport.module.ts
 */
import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { PublisherModule } from './publisher/publisher.module';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [AppConfigModule, PublisherModule, TransportModule],
})
export class AppModule {}
