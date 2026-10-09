/**
 * نقشه سرویس پردازش.
 * قانون و فهرست حافظه باید پیش از رسیدن رویداد آماده باشد.
 * rules.module.ts
 * ذخیره رویداد اینجاست.
 * events.module.ts
 * اتصال به سرویس عامل اینجاست.
 * subscriber.module.ts
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_CONFIG } from './config/app-config.interface';
import type { AppConfig } from './config/app-config.interface';
import { AppConfigModule } from './config/app-config.module';
import { EventsModule } from './events/events.module';
import { RedisModule } from './redis/redis.module';
import { RulesModule } from './rules/rules.module';
import { SubscriberModule } from './subscriber/subscriber.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({ uri: config.mongoUri }),
    }),
    RedisModule,
    RulesModule,
    EventsModule,
    SubscriberModule,
  ],
})
export class AppModule {}
