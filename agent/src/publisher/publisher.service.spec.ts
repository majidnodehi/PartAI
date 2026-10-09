import { loadAppConfig } from '../config/load-app-config';
import { BrokerService } from '../broker/broker.service';
import { MetricGeneratorService } from '../metrics/metric-generator.service';
import { PublisherService } from './publisher.service';

describe('PublisherService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('publishes the configured event count across the interval', async () => {
    const config = loadAppConfig({
      AGENT_INSTANCE_ID: 'test01',
      EVENT_COUNT: '5',
      INTERVAL_SECONDS: '1',
      LOG_EVERY_SECONDS: '0',
    });
    const broker = new BrokerService(config);
    const generator = new MetricGeneratorService(config);
    const publisher = new PublisherService(broker, generator, config);
    await generator.whenReady();

    jest.useFakeTimers();
    await publisher.onModuleInit();
    jest.advanceTimersByTime(1000);

    expect(broker.publishedCount).toBe(5);
    publisher.onModuleDestroy();
    jest.advanceTimersByTime(1000);
    expect(broker.publishedCount).toBe(5);
  });
});
