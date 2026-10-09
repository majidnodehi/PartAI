import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PageQueryDto } from '../../dto/page-query.dto';
import { MetricName } from '../../domain/metric-name';
import { metricEnumSchema } from '../../openapi/enum-schemas';

@ApiSchema({
  description: 'Filters and paging for stored events.',
})
export class EventQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    description: 'Return only events for this metric.',
    enum: MetricName,
    enumName: 'MetricName',
    enumSchema: metricEnumSchema,
    example: MetricName.Temperature,
  })
  @IsOptional()
  @IsEnum(MetricName)
  name?: MetricName;

  @ApiPropertyOptional({
    description: 'Return only events published by this agent instance.',
    maxLength: 32,
    example: 'k7m2qx',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  agentInstanceId?: string;
}
