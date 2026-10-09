import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { BrokerService } from '../broker/broker.service';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import type { RecentEventsResponse } from '../domain/http-response.interface';
import type { TelemetryEvent } from '../domain/telemetry-event.interface';
import { MetricNamesQueryDto } from '../dto/metric-names-query.dto';
import { RecentEventsQueryDto } from '../dto/recent-events-query.dto';
import { TelemetryEventDto } from '../dto/telemetry-event.dto';
import { parseMetricNamesQuery } from './parse-metric-names';

const DEFAULT_RECENT_LIMIT = 100;
const HEARTBEAT_MS = 15_000;

/**
 * خروجی وب.
 * یک مسیر برای فرستادن رویداد دستی است.
 * یک مسیر رویدادهای اخیر را برمی‌گرداند.
 * یک مسیر جریان زنده رویدادها را می‌فرستد.
 */
@Controller('events')
export class EventsController {
  constructor(
    private readonly broker: BrokerService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  publish(@Body() event: TelemetryEventDto): TelemetryEvent {
    this.broker.publish(event);
    return { name: event.name, value: event.value };
  }

  @Get()
  recent(@Query() query: RecentEventsQueryDto): RecentEventsResponse {
    const names = parseMetricNamesQuery(query.names);
    return {
      instanceId: this.config.instanceId,
      events: this.broker.recent(query.limit ?? DEFAULT_RECENT_LIMIT, names),
    };
  }

  @Get('stream')
  stream(@Query() query: MetricNamesQueryDto, @Res() response: Response): void {
    const names = parseMetricNamesQuery(query.names);
    response.status(HttpStatus.OK);
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');
    response.socket?.setNoDelay(true);
    response.flushHeaders();
    response.write(`: instance ${this.config.instanceId}\n\n`);

    const subscription: { unsubscribe: () => void } = {
      unsubscribe: () => undefined,
    };
    subscription.unsubscribe = this.broker.subscribe((event, encoded) => {
      if (names && !names.has(event.name)) {
        return;
      }
      if (
        response.writableEnded ||
        response.writableLength > this.config.maxBufferedBytes
      ) {
        if (response.writableEnded) {
          subscription.unsubscribe();
        } else {
          this.broker.recordDrop();
        }
        return;
      }
      try {
        response.write(`data: ${encoded}\n\n`);
      } catch {
        subscription.unsubscribe();
      }
    });

    const heartbeat = setInterval(() => {
      if (response.writableEnded || response.writableLength > 0) {
        return;
      }
      response.write(': ping\n\n');
    }, HEARTBEAT_MS);
    heartbeat.unref();

    response.on('close', () => {
      clearInterval(heartbeat);
      subscription.unsubscribe();
    });
  }
}
