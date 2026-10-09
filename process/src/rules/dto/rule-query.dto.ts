import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { metricEnumSchema } from '../../openapi/enum-schemas';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PageQueryDto } from '../../dto/page-query.dto';
import { MetricName } from '../../domain/metric-name';

@ApiSchema({
  description: 'Filters and paging for the rule list.',
})
export class RuleQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    description: 'Return only rules for this telemetry signal.',
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
      'Return only enabled rules when true, or only disabled rules when false.',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) {
      return true;
    }
    if (value === 'false' || value === false) {
      return false;
    }
    return value;
  })
  @IsBoolean()
  enabled?: boolean;
}
