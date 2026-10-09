import { loadAppConfig } from '../config/load-app-config';
import { METRIC_NAMES, MetricName } from '../domain/metric-name';
import { MetricGeneratorService } from './metric-generator.service';

describe('MetricGeneratorService', () => {
  it('walks the catalog in order and stays inside each range', async () => {
    const { faker } = await import('@faker-js/faker');
    faker.seed(7);
    const generator = new MetricGeneratorService(
      loadAppConfig({
        AGENT_INSTANCE_ID: 'test01',
      }),
    );
    await generator.whenReady();
    faker.seed(7);

    const samples = METRIC_NAMES.map(() => generator.next());
    expect(samples.map((sample) => sample.name)).toEqual([...METRIC_NAMES]);
    expect(generator.next().name).toBe(MetricName.Speed);

    const speed = samples[0];
    const temperature = samples[1];
    expect(speed.value).toBeGreaterThanOrEqual(0);
    expect(speed.value).toBeLessThanOrEqual(180);
    expect(temperature.value).toBeGreaterThanOrEqual(-20);
    expect(temperature.value).toBeLessThanOrEqual(120);
  });
});
