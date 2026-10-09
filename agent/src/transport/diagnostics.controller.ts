import { Controller, Get, Inject } from '@nestjs/common';
import { BrokerService } from '../broker/broker.service';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import type { DiagnosticsResponse } from '../domain/http-response.interface';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(
    private readonly broker: BrokerService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Get()
  get(): DiagnosticsResponse {
    return {
      instanceId: this.config.instanceId,
      uptimeMs: Math.round(process.uptime() * 1000),
      port: this.config.port,
      wsPath: this.config.wsPath,
      eventCount: this.config.eventCount,
      intervalSeconds: this.config.intervalSeconds,
      published: this.broker.publishedCount,
      subscribers: this.broker.subscriberCount,
      buffered: this.broker.bufferedCount,
      bufferCapacity: this.config.eventBufferSize,
      dropped: this.broker.droppedCount,
      listenerErrors: this.broker.listenerErrorCount,
      metrics: this.config.metrics.map((metric) => metric.name),
    };
  }
}
