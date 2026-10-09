import { Module } from '@nestjs/common';
import { MetricGeneratorService } from './metric-generator.service';

@Module({
  providers: [MetricGeneratorService],
  exports: [MetricGeneratorService],
})
export class MetricsModule {}
