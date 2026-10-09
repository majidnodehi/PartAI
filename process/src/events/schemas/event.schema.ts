import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { METRIC_NAMES, type MetricName } from '../../domain/metric-name';

/** همه رویدادهای دریافتی، بدون سقف. */
@Schema({ collection: 'events', versionKey: false })
export class EventEntity {
  @Prop({ required: true, index: true })
  agentInstanceId!: string;

  @Prop({ required: true, enum: METRIC_NAMES, index: true })
  name!: MetricName;

  @Prop({ required: true })
  value!: number;

  @Prop({ required: true, index: true })
  receivedAt!: Date;
}

export type EventDocument = HydratedDocument<EventEntity>;
export const EventSchema = SchemaFactory.createForClass(EventEntity);

EventSchema.index({ name: 1, receivedAt: -1 });
EventSchema.index({ agentInstanceId: 1, receivedAt: -1 });
