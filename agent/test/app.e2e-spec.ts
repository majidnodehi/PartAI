import { get, type Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { WebSocket, type RawData } from 'ws';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

interface DiagnosticsBody {
  instanceId: string;
  eventCount: number;
  intervalSeconds: number;
  wsPath: string;
  metrics: string[];
}

interface RecentEventsBody {
  instanceId: string;
  events: Array<{ name: string; value: number }>;
}

function boundPort(app: INestApplication): number {
  const server = app.getHttpServer() as Server;
  const address = server.address();
  if (address && typeof address === 'object') {
    return address.port;
  }
  throw new Error('Server is not listening');
}

function frameText(data: RawData): string {
  if (typeof data === 'string') {
    return data;
  }
  if (Buffer.isBuffer(data)) {
    return data.toString('utf8');
  }
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString('utf8');
  }
  return Buffer.from(data).toString('utf8');
}

describe('Agent (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication({ logger: ['error', 'warn'] });
    configureApp(app);
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/diagnostics identifies this instance', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/diagnostics')
      .expect(200);
    const body = response.body as DiagnosticsBody;
    expect(response.headers['x-agent-instance-id']).toBe('k7m2qx');
    expect(body).toMatchObject({
      instanceId: 'k7m2qx',
      eventCount: 5,
      intervalSeconds: 1,
      wsPath: '/events',
    });
    expect(body.metrics).toEqual(
      expect.arrayContaining(['speed', 'temperature', 'voltage', 'noise']),
    );
  });

  it('POST /api/events accepts a name/value event and keeps it in the buffer', async () => {
    await request(app.getHttpServer())
      .post('/api/events')
      .send({ name: 'voltage', value: 12.5 })
      .expect(202)
      .expect({ name: 'voltage', value: 12.5 });

    const response = await request(app.getHttpServer())
      .get('/api/events')
      .query({ names: 'voltage', limit: 50 })
      .expect(200);
    const body = response.body as RecentEventsBody;
    expect(body.instanceId).toBe('k7m2qx');
    expect(body.events).toEqual(
      expect.arrayContaining([{ name: 'voltage', value: 12.5 }]),
    );
  });

  it('POST /api/events rejects extra fields', () => {
    return request(app.getHttpServer())
      .post('/api/events')
      .send({ name: 'voltage', value: 1, unit: 'V' })
      .expect(400);
  });

  it('GET /api/events/stream pushes server-sent events', async () => {
    const port = boundPort(app);
    const body = await new Promise<string>((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        req.destroy();
        reject(new Error('timed out waiting for a server-sent event'));
      }, 3000);
      const req = get(
        `http://127.0.0.1:${port}/api/events/stream`,
        (response) => {
          expect(response.headers['x-agent-instance-id']).toBe('k7m2qx');
          expect(response.headers['content-type']).toContain(
            'text/event-stream',
          );
          let data = '';
          response.on('data', (chunk: Buffer) => {
            data += chunk.toString();
            if (!data.includes('\ndata: {')) {
              return;
            }
            settled = true;
            clearTimeout(timer);
            response.destroy();
            resolve(data);
          });
        },
      );
      req.on('error', (error) => {
        if (settled) {
          return;
        }
        clearTimeout(timer);
        reject(error);
      });
    });
    expect(body).toContain(': instance k7m2qx');
    expect(body).toMatch(/data: \{"name":"[a-z0-9_]+","value":-?\d/);
  });

  it('pushes filtered events over WebSocket', async () => {
    const port = boundPort(app);
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`ws://127.0.0.1:${port}/events`);
      let armed = false;
      const timer = setTimeout(() => {
        socket.terminate();
        reject(new Error('timed out waiting for a filtered websocket event'));
      }, 3000);
      const fail = (error: Error) => {
        clearTimeout(timer);
        socket.terminate();
        reject(error);
      };
      socket.on('error', fail);
      socket.on('open', () => {
        socket.send(JSON.stringify({ names: ['voltage'] }));
        setTimeout(() => {
          armed = true;
          void request(app.getHttpServer())
            .post('/api/events')
            .send({ name: 'voltage', value: 999 })
            .expect(202)
            .catch((error: Error) => fail(error));
        }, 50);
      });
      socket.on('message', (data) => {
        if (!armed) {
          return;
        }
        const text = frameText(data);
        const event = JSON.parse(text) as {
          name?: unknown;
          value?: unknown;
        };
        if (event.name !== 'voltage') {
          fail(new Error(`filter leaked ${text}`));
          return;
        }
        if (Object.keys(event).length !== 2) {
          fail(new Error(`event must have 2 fields: ${text}`));
          return;
        }
        if (event.value !== 999) {
          return;
        }
        clearTimeout(timer);
        socket.close();
        resolve();
      });
    });
  });
});
