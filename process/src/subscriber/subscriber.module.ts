import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { RulesModule } from '../rules/rules.module';
import { AgentSubscriberService } from './agent-subscriber.service';
import { StatusController } from './status.controller';

@Module({
  imports: [EventsModule, RulesModule],
  controllers: [StatusController],
  providers: [AgentSubscriberService],
})
export class SubscriberModule {}
