import { Module } from '@nestjs/common';
import { BrokerModule } from '../broker/broker.module';
import { MetricsModule } from '../metrics/metrics.module';
import { PublisherService } from './publisher.service';

@Module({
  imports: [BrokerModule, MetricsModule],
  providers: [PublisherService],
})
export class PublisherModule {}
