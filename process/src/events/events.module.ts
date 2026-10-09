import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EVENT_STORE } from '../domain/event-store.interface';
import { RulesModule } from '../rules/rules.module';
import { EventIngestHandler } from './event-ingest.handler';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventEntity, EventSchema } from './schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventSchema },
    ]),
    RulesModule,
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventIngestHandler,
    { provide: EVENT_STORE, useExisting: EventsService },
  ],
  exports: [EventIngestHandler],
})
export class EventsModule {}
