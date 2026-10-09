import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { MetricName } from '../../domain/metric-name';
import { metricEnumSchema } from '../../openapi/enum-schemas';

@ApiSchema({
  description:
    'One telemetry event stored after it was received from the agent.',
})
export class EventResponseDto {
  @ApiProperty({
    description: 'MongoDB id assigned when the event was stored.',
    example: '66f0c2b5e1a4c3d2b1a09877',
  })
  id!: string;

  @ApiProperty({
    description:
      'Unique id of the agent instance that published the event. Read from the agent diagnostics endpoint, not from the event body.',
    example: 'k7m2qx',
  })
  agentInstanceId!: string;

  @ApiProperty({
    description: 'Metric name published by the agent.',
    enum: MetricName,
    enumName: 'MetricName',
    enumSchema: metricEnumSchema,
    example: MetricName.Temperature,
  })
  name!: MetricName;

  @ApiProperty({
    description: 'Numeric sample published by the agent.',
    example: 91.2,
  })
  value!: number;

  @ApiProperty({
    description: 'When this service received the event.',
    type: String,
    format: 'date-time',
    example: '2026-10-08T11:00:00.000Z',
  })
  receivedAt!: Date;
}

@ApiSchema({
  description: 'One page of stored events, newest first.',
})
export class EventPageDto {
  @ApiProperty({
    description: 'Events on this page, newest first.',
    type: [EventResponseDto],
  })
  items!: EventResponseDto[];

  @ApiProperty({
    description: 'Number of events that match the filter, across all pages.',
    example: 1,
  })
  total!: number;

  @ApiProperty({
    description: 'Page number that was returned. The first page is 1.',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Maximum number of events included in this page.',
    example: 20,
  })
  limit!: number;
}
