import { Global, Module } from '@nestjs/common';
import { EVENT_CACHE } from '../domain/event-store.interface';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    { provide: EVENT_CACHE, useExisting: RedisService },
  ],
  exports: [RedisService, EVENT_CACHE],
})
export class RedisModule {}
