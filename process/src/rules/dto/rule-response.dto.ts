import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  metricEnumSchema,
  operatorEnumSchema,
} from '../../openapi/enum-schemas';
import { MetricName } from '../../domain/metric-name';
import { RuleOperator } from '../../domain/rule-operator';

@ApiSchema({
  description:
    'Rule fields copied onto a match so later edits do not change history.',
})
export class RuleSnapshotDto {
  @ApiProperty({
    description: 'MongoDB id of the rule.',
    example: '66f0c2b5e1a4c3d2b1a09876',
  })
  id!: string;

  @ApiProperty({
    description: 'Short name stored with the rule and copied onto each match.',
    example: 'High temperature',
    maxLength: 80,
  })
  title!: string;

  @ApiProperty({
    description: 'Telemetry signal compared with the event name.',
    enum: MetricName,
    enumName: 'MetricName',
    enumSchema: metricEnumSchema,
    example: MetricName.Temperature,
  })
  metric!: MetricName;

  @ApiProperty({
    description:
      'Comparison applied to the event value. gt means greater than, gte means greater than or equal, lt means less than, lte means less than or equal, eq means equal, and between means an inclusive range.',
    enum: RuleOperator,
    enumName: 'RuleOperator',
    enumSchema: operatorEnumSchema,
    example: RuleOperator.GreaterThan,
  })
  operator!: RuleOperator;

  @ApiProperty({
    description:
      'Threshold compared with the event value. For a between rule this is the inclusive lower bound.',
    example: 80,
  })
  value!: number;

  @ApiProperty({
    description:
      'Inclusive upper bound when the operator is between. Null for every other operator.',
    type: Number,
    nullable: true,
    example: null,
  })
  valueTo!: number | null;
}

@ApiSchema({
  description: 'A stored rule, including its id, enabled flag, and timestamps.',
})
export class RuleResponseDto extends RuleSnapshotDto {
  @ApiProperty({
    description: 'When false the rule is stored and left out of evaluation.',
    example: true,
  })
  enabled!: boolean;

  @ApiProperty({
    description: 'When the rule was created.',
    type: String,
    format: 'date-time',
    example: '2026-10-08T11:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'When the rule was last changed.',
    type: String,
    format: 'date-time',
    example: '2026-10-08T11:00:00.000Z',
  })
  updatedAt!: Date;
}

@ApiSchema({
  description: 'One page of rules, most recently updated first.',
})
export class RulePageDto {
  @ApiProperty({
    description: 'Rules on this page, most recently updated first.',
    type: [RuleResponseDto],
  })
  items!: RuleResponseDto[];

  @ApiProperty({
    description: 'Number of rules that match the filter, across all pages.',
    example: 1,
  })
  total!: number;

  @ApiProperty({
    description: 'Page number that was returned. The first page is 1.',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Maximum number of rules included in this page.',
    example: 20,
  })
  limit!: number;
}
