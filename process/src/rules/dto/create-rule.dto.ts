import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import {
  metricEnumSchema,
  operatorEnumSchema,
} from '../../openapi/enum-schemas';
import {
  IsBoolean,
  IsDefined,
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
  description: 'Fields required to store a new telemetry rule.',
})
export class CreateRuleDto {
  @ApiProperty({
    description: 'Short name stored with the rule and copied onto each match.',
    minLength: 1,
    maxLength: 80,
    example: 'High temperature',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title: string;

  @ApiProperty({
    description: 'Telemetry signal compared with the event name.',
    enum: MetricName,
    enumName: 'MetricName',
    enumSchema: metricEnumSchema,
    example: MetricName.Temperature,
  })
  @IsEnum(MetricName)
  metric: MetricName;

  @ApiProperty({
    description:
      'Comparison applied to the event value. gt means greater than, gte means greater than or equal, lt means less than, lte means less than or equal, eq means equal, and between means an inclusive range.',
    enum: RuleOperator,
    enumName: 'RuleOperator',
    enumSchema: operatorEnumSchema,
    example: RuleOperator.GreaterThan,
  })
  @IsEnum(RuleOperator)
  operator: RuleOperator;

  @ApiProperty({
    description:
      'Threshold compared with the event value. For a between rule this is the inclusive lower bound.',
    example: 80,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  value: number;

  @ApiPropertyOptional({
    description:
      'Inclusive upper bound. Required when the operator is between, and it must be greater than value.',
    example: 100,
  })
  @ValidateIf((rule: CreateRuleDto) => rule.operator === RuleOperator.Between)
  @IsDefined()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  valueTo?: number;

  @ApiPropertyOptional({
    description:
      'When false the rule is stored and left out of evaluation. Defaults to true.',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
