import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { pageWindow, type Page } from '../domain/page.interface';
import type { EventStore } from '../domain/event-store.interface';
import type { StoredEvent } from '../domain/telemetry-event.interface';
import type { EventQueryDto } from './dto/event-query.dto';
import { EventEntity, type EventDocument } from './schemas/event.schema';

@Injectable()
export class EventsService implements EventStore {
  constructor(
    @InjectModel(EventEntity.name)
    private readonly events: Model<EventDocument>,
  ) {}

  async save(event: StoredEvent): Promise<void> {
    const document = new this.events({
      agentInstanceId: event.agentInstanceId,
      name: event.name,
      value: event.value,
      receivedAt: event.receivedAt,
    });
    document._id = new Types.ObjectId(event.id);
    await document.save();
  }

  async list(query: EventQueryDto): Promise<Page<StoredEvent>> {
    const { page, limit, skip } = pageWindow(query.page, query.limit);
    const filter: FilterQuery<EventEntity> = {};
    if (query.name) {
      filter.name = query.name;
    }
    if (query.agentInstanceId) {
      filter.agentInstanceId = query.agentInstanceId;
    }
    const [documents, total] = await Promise.all([
      this.events
        .find(filter)
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.events.countDocuments(filter),
    ]);
    return {
      items: documents.map((document) => ({
        id: String(document._id),
        agentInstanceId: document.agentInstanceId,
        name: document.name,
        value: document.value,
        receivedAt: document.receivedAt,
      })),
      total,
      page,
      limit,
    };
  }
}
