import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { RuleSnapshot } from '../../domain/rule.interface';
import type { StoredEvent } from '../../domain/telemetry-event.interface';

/** نتیجه یک تطبیق: کدام سرویس عامل، کدام قانون، و کدام رویداد. */
@Schema({ collection: 'rule_matches', versionKey: false })
export class RuleMatchEntity {
  @Prop({ required: true, index: true })
  agentInstanceId: string;

  @Prop({ required: true, index: true })
  ruleId: string;

  @Prop({ type: Object, required: true })
  rule: RuleSnapshot;

  @Prop({ type: Object, required: true })
  event: StoredEvent;

  @Prop({ required: true, index: true })
  matchedAt: Date;
}

export type RuleMatchDocument = HydratedDocument<RuleMatchEntity>;
export const RuleMatchSchema = SchemaFactory.createForClass(RuleMatchEntity);

RuleMatchSchema.index({ ruleId: 1, matchedAt: -1 });
RuleMatchSchema.index({ agentInstanceId: 1, matchedAt: -1 });
