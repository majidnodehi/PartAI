import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import {
  metricEnumSchema,
  operatorEnumSchema,
} from '../../openapi/enum-schemas';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { MetricName } from '../../domain/metric-name';
import { RuleOperator } from '../../domain/rule-operator';

@ApiSchema({
  description:
    'Fields to change on an existing rule. Omitted fields stay as they are.',
})
export class UpdateRuleDto {
  @ApiPropertyOptional({
    description:
      'Short name stored with the rule and copied onto each match. Omitted values stay unchanged.',
    minLength: 1,
    maxLength: 80,
    example: 'High temperature',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title?: string;

  @ApiPropertyOptional({
    description:
      'Telemetry signal compared with the event name. Omitted values stay unchanged.',
    enum: MetricName,
    enumName: 'MetricName',
    enumSchema: metricEnumSchema,
    example: MetricName.Temperature,
  })
  @IsOptional()
  @IsEnum(MetricName)
  metric?: MetricName;

  @ApiPropertyOptional({
    description:
      'Comparison applied to the event value. gt means greater than, gte means greater than or equal, lt means less than, lte means less than or equal, eq means equal, and between means an inclusive range. Omitted values stay unchanged.',
    enum: RuleOperator,
    enumName: 'RuleOperator',
    enumSchema: operatorEnumSchema,
    example: RuleOperator.GreaterThan,
  })
  @IsOptional()
  @IsEnum(RuleOperator)
  operator?: RuleOperator;

  @ApiPropertyOptional({
    description:
      'Threshold compared with the event value. For a between rule this is the inclusive lower bound. Omitted values stay unchanged.',
    example: 80,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  value?: number;

  @ApiPropertyOptional({
    description:
      'Inclusive upper bound. Required when the resulting operator is between, and it must be greater than value. Send null for every other operator. Omitted values stay unchanged.',
    type: Number,
    nullable: true,
    example: 100,
  })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  valueTo?: number | null;

  @ApiPropertyOptional({
    description:
      'When false the rule is stored and left out of evaluation. Omitted values stay unchanged.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
