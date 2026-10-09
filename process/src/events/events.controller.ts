import { Controller, Get, Query } from '@nestjs/common';
import type { Page } from '../domain/page.interface';
import type { StoredEvent } from '../domain/telemetry-event.interface';
import { EventQueryDto } from './dto/event-query.dto';
import { EventsTag, listEventsDocs } from './events.docs';
import { EventsService } from './events.service';

@EventsTag
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @listEventsDocs
  list(@Query() query: EventQueryDto): Promise<Page<StoredEvent>> {
    return this.events.list(query);
  }
}
