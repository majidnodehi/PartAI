import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { METRIC_NAMES, type MetricName } from '../../domain/metric-name';
import { RULE_OPERATORS, type RuleOperator } from '../../domain/rule-operator';

/**
 * تعریف قانون.
 * مقایسه یکی از این‌هاست: بزرگ‌تر، بزرگ‌تر یا مساوی، کوچک‌تر، کوچک‌تر یا مساوی، مساوی، و بازه.
 * مقایسه بازه به حد بالا نیاز دارد.
 * قانون خاموش در پایگاه می‌ماند ولی در بررسی رویداد نمی‌آید.
 */
@Schema({ collection: 'rules', versionKey: false, timestamps: true })
export class RuleEntity {
  @Prop({ required: true, trim: true, maxlength: 80 })
  title: string;

  @Prop({ required: true, enum: METRIC_NAMES, index: true })
  metric: MetricName;

  @Prop({ required: true, enum: RULE_OPERATORS })
  operator: RuleOperator;

  @Prop({ required: true })
  value: number;

  @Prop({ type: Number, default: null })
  valueTo: number | null;

  @Prop({ required: true, default: true, index: true })
  enabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type RuleDocument = HydratedDocument<RuleEntity>;
export const RuleSchema = SchemaFactory.createForClass(RuleEntity);

RuleSchema.index({ metric: 1, enabled: 1 });
