import { Module } from '@nestjs/common';
import { BrokerModule } from '../broker/broker.module';
import { DiagnosticsController } from './diagnostics.controller';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [BrokerModule],
  controllers: [EventsController, DiagnosticsController],
  providers: [EventsGateway],
})
export class TransportModule {}
