/**
 * خروجی سوکت.
 * مسیر سوکت از تنظیم‌ها خوانده می‌شود.
 * اگر نام سنجه‌ها فرستاده شود فقط همان‌ها می‌آید. فهرست خالی یعنی همه سنجه‌ها.
 * بارگذاری محیط باید پیش از بقیه وارد کردن‌ها باشد.
 * load-env.ts
 */
import '../config/load-env';
import { Inject, Logger, type OnModuleDestroy } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { WebSocket, type RawData } from 'ws';
import { isRecord } from '../common/is-record';
import { BrokerService } from '../broker/broker.service';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import { readWsPath } from '../config/load-app-config';
import { SubscribeFilterDto } from '../dto/subscribe-filter.dto';

const wsPath = readWsPath(process.env);

interface ClientSession {
  names: ReadonlySet<string> | null;
  unsubscribe: () => void;
}

function rawDataToString(data: RawData): string {
  if (typeof data === 'string') {
    return data;
  }
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString('utf8');
  }
  if (Buffer.isBuffer(data)) {
    return data.toString('utf8');
  }
  return Buffer.from(data).toString('utf8');
}

@WebSocketGateway({
  path: wsPath,
  perMessageDeflate: false,
  maxPayload: 4096,
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  private readonly logger = new Logger(EventsGateway.name);
  private readonly sessions = new Map<WebSocket, ClientSession>();

  constructor(
    private readonly broker: BrokerService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  handleConnection(client: WebSocket): void {
    const session: ClientSession = {
      names: null,
      unsubscribe: () => undefined,
    };
    session.unsubscribe = this.broker.subscribe((event, encoded) => {
      const names = session.names;
      if (names && !names.has(event.name)) {
        return;
      }
      if (client.readyState !== WebSocket.OPEN) {
        session.unsubscribe();
        return;
      }
      if (client.bufferedAmount > this.config.maxBufferedBytes) {
        this.broker.recordDrop();
        return;
      }
      try {
        client.send(encoded);
      } catch {
        session.unsubscribe();
      }
    });
    this.sessions.set(client, session);
    client.on('message', (data: RawData) => {
      this.applyFilter(client, data);
    });
    client.on('error', () => {
      this.removeClient(client);
    });
  }

  handleDisconnect(client: WebSocket): void {
    this.removeClient(client);
  }

  onModuleDestroy(): void {
    for (const session of this.sessions.values()) {
      session.unsubscribe();
    }
    this.sessions.clear();
  }

  /** Client text frame: {"names":["temperature","voltage"]}. An empty list selects every metric. */
  private applyFilter(client: WebSocket, data: RawData): void {
    const session = this.sessions.get(client);
    if (!session) {
      return;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(rawDataToString(data)) as unknown;
    } catch {
      return;
    }
    if (!isRecord(payload) || !Array.isArray(payload.names)) {
      return;
    }
    const dto = plainToInstance(SubscribeFilterDto, { names: payload.names });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      this.logger.warn('Ignored an invalid WebSocket subscription filter.');
      return;
    }
    session.names = dto.names.length === 0 ? null : new Set(dto.names);
  }

  private removeClient(client: WebSocket): void {
    const session = this.sessions.get(client);
    if (!session) {
      return;
    }
    session.unsubscribe();
    this.sessions.delete(client);
  }
}
