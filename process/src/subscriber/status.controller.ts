import { Controller, Get } from '@nestjs/common';
import { AgentSubscriberService } from './agent-subscriber.service';
import { StatusTag, statusDocs } from './status.docs';

@StatusTag
@Controller('status')
export class StatusController {
  constructor(private readonly subscriber: AgentSubscriberService) {}

  @Get()
  @statusDocs
  get(): {
    connected: boolean;
    agentInstanceId: string | null;
    activeRules: number;
  } {
    return this.subscriber.status();
  }
}
