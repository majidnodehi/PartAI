import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { MetricName } from '../domain/metric-name';

export class SubscribeFilterDto {
  @IsArray()
  @ArrayMaxSize(64)
  @ArrayUnique()
  @IsEnum(MetricName, {
    each: true,
    message: 'names must be known metrics',
  })
  names: MetricName[];
}
