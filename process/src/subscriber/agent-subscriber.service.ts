import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RawData, WebSocket } from 'ws';
import { isRecord } from '../common/is-record';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import { isMetricName } from '../domain/metric-name';
import type { AgentEvent } from '../domain/telemetry-event.interface';
import { EventIngestHandler } from '../events/event-ingest.handler';
import { RuleCacheService } from '../rules/rule-cache.service';

interface SubscriberStatus {
  readonly connected: boolean;
  readonly agentInstanceId: string | null;
  readonly activeRules: number;
}

/**
 * ورودی رویداد.
 * اول وضعیت سرویس عامل خوانده می‌شود تا شناسه یکتا و مسیر سوکت معلوم شود.
 * بدنه رویداد فقط نام و مقدار است.
 * شناسه از وضعیت سرویس عامل می‌آید، نه از خود رویداد.
 * اگر اتصال قطع شود، با فاصله بیشتر دوباره وصل می‌شود.
 */
@Injectable()
export class AgentSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentSubscriberService.name);
  private socket: WebSocket | null = null;
  private sleepTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;
  private connected = false;
  private attempt = 0;
  private agentInstanceId: string | null = null;

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly ingest: EventIngestHandler,
    private readonly rules: RuleCacheService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rules.start();
    void this.run();
  }

  onModuleDestroy(): void {
    this.stopped = true;
    this.socket?.close();
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
    }
  }

  status(): SubscriberStatus {
    return {
      connected: this.connected,
      agentInstanceId: this.agentInstanceId,
      activeRules: this.rules.activeCount(),
    };
  }

  private async run(): Promise<void> {
    while (!this.stopped) {
      try {
        const agent = await this.readAgent();
        this.agentInstanceId = agent.instanceId;
        this.logger.log(
          `subscribed to agent ${agent.instanceId} at ${agent.wsUrl}`,
        );
        await this.consume(agent.wsUrl, agent.instanceId);
      } catch (error: unknown) {
        this.connected = false;
        this.logger.error(
          error instanceof Error ? error.message : 'Agent subscription failed',
        );
      }
      if (this.stopped) {
        return;
      }
      await this.sleep(this.nextDelay());
    }
  }

  private async readAgent(): Promise<{ instanceId: string; wsUrl: string }> {
    const response = await fetch(
      new URL('/api/diagnostics', this.config.agentBaseUrl),
      { signal: AbortSignal.timeout(3000) },
    );
    if (!response.ok) {
      throw new Error(`Agent diagnostics returned ${response.status}`);
    }
    const body: unknown = await response.json();
    if (
      !isRecord(body) ||
      typeof body.instanceId !== 'string' ||
      body.instanceId.length === 0 ||
      typeof body.wsPath !== 'string'
    ) {
      throw new Error('Agent diagnostics did not include an instance id.');
    }
    const wsUrl = new URL(body.wsPath, this.config.agentBaseUrl);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return { instanceId: body.instanceId, wsUrl: wsUrl.href };
  }

  private consume(wsUrl: string, agentInstanceId: string): Promise<void> {
    return new Promise((resolve) => {
      const socket = new WebSocket(wsUrl);
      this.socket = socket;
      socket.on('open', () => {
        this.connected = true;
        this.attempt = 0;
      });
      socket.on('message', (data: RawData) => {
        const event = parseAgentEvent(data);
        if (!event) {
          return;
        }
        void this.ingest
          .handle(event, agentInstanceId)
          .catch((error: unknown) => {
            this.logger.error(
              error instanceof Error ? error.message : 'Event ingest failed',
            );
          });
      });
      socket.on('close', () => {
        this.connected = false;
        if (this.socket === socket) {
          this.socket = null;
        }
        resolve();
      });
      socket.on('error', (error: Error) => {
        this.logger.error(error.message);
      });
    });
  }

  private nextDelay(): number {
    const delay = Math.min(10_000, 500 * 2 ** this.attempt);
    this.attempt = Math.min(this.attempt + 1, 5);
    return delay;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.sleepTimer = setTimeout(resolve, ms);
    });
  }
}

function parseAgentEvent(data: RawData): AgentEvent | null {
  let payload: unknown;
  try {
    payload = JSON.parse(rawDataToString(data)) as unknown;
  } catch {
    return null;
  }
  if (!isRecord(payload)) {
    return null;
  }
  if (typeof payload.name !== 'string' || !isMetricName(payload.name)) {
    return null;
  }
  if (typeof payload.value !== 'number' || !Number.isFinite(payload.value)) {
    return null;
  }
  return { name: payload.name, value: payload.value };
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
