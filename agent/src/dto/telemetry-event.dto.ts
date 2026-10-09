import { IsEnum, IsNumber } from 'class-validator';
import { MetricName } from '../domain/metric-name';
import type { TelemetryEvent } from '../domain/telemetry-event.interface';

export class TelemetryEventDto implements TelemetryEvent {
  @IsEnum(MetricName, { message: 'name must be a known metric' })
  name: MetricName;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  value: number;
}
