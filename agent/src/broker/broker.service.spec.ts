import { loadAppConfig } from '../config/load-app-config';
import { BrokerService } from './broker.service';

function createBroker(bufferSize = 8): BrokerService {
  return new BrokerService(
    loadAppConfig({
      AGENT_INSTANCE_ID: 'test01',
      EVENT_BUFFER_SIZE: String(bufferSize),
    }),
  );
}

describe('BrokerService', () => {
  it('keeps only the newest events in the ring buffer', () => {
    const broker = createBroker(3);
    for (const value of [1, 2, 3, 4]) {
      broker.publish({ name: 'voltage', value });
    }
    expect(broker.recent(10)).toEqual([
      { name: 'voltage', value: 2 },
      { name: 'voltage', value: 3 },
      { name: 'voltage', value: 4 },
    ]);
    expect(broker.bufferedCount).toBe(3);
    expect(broker.publishedCount).toBe(4);
  });

  it('filters recent events by metric name', () => {
    const broker = createBroker();
    broker.publish({ name: 'speed', value: 1 });
    broker.publish({ name: 'noise', value: 2 });
    broker.publish({ name: 'speed', value: 3 });
    expect(broker.recent(10, new Set(['speed']))).toEqual([
      { name: 'speed', value: 1 },
      { name: 'speed', value: 3 },
    ]);
  });

  it('encodes each published event once for every listener', () => {
    const broker = createBroker();
    const encoded: string[] = [];
    broker.subscribe((_event, value) => encoded.push(value));
    broker.subscribe((_event, value) => encoded.push(value));
    broker.publish({ name: 'humidity', value: 40 });
    expect(encoded).toEqual([
      '{"name":"humidity","value":40}',
      '{"name":"humidity","value":40}',
    ]);
    expect(encoded[0]).toBe(encoded[1]);
  });

  it('stops delivery after unsubscribe and isolates listener failures', () => {
    const broker = createBroker();
    const received: number[] = [];
    broker.subscribe(() => {
      throw new Error('boom');
    });
    const stop = broker.subscribe((event) => received.push(event.value));
    broker.publish({ name: 'noise', value: 10 });
    stop();
    broker.publish({ name: 'noise', value: 11 });
    expect(received).toEqual([10]);
    expect(broker.listenerErrorCount).toBe(1);
    expect(broker.subscriberCount).toBe(1);
  });
});
