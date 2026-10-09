import { METRIC_NAMES } from '../domain/metric-name';
import { loadAppConfig } from './load-app-config';

function validEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    AGENT_INSTANCE_ID: 'k7m2qx',
    ...overrides,
  };
}

describe('loadAppConfig', () => {
  it('loads defaults for a short instance id', () => {
    const config = loadAppConfig(validEnv());
    expect(config.instanceId).toBe('k7m2qx');
    expect(config.port).toBe(3000);
    expect(config.eventCount).toBe(5);
    expect(config.intervalSeconds).toBe(1);
    expect(config.wsPath).toBe('/events');
    expect(config.metrics.map((metric) => metric.name)).toEqual([
      ...METRIC_NAMES,
    ]);
  });

  it('rejects an instance id that is not short and lowercase', () => {
    expect(() =>
      loadAppConfig(validEnv({ AGENT_INSTANCE_ID: 'Agent' })),
    ).toThrow(/AGENT_INSTANCE_ID/);
  });

  it('overrides a catalog range and keeps every metric', () => {
    const config = loadAppConfig(
      validEnv({
        METRIC_DEFS: JSON.stringify([
          { name: 'speed', min: 0, max: 90, fractionDigits: 0 },
        ]),
      }),
    );
    expect(config.metrics.map((metric) => metric.name)).toEqual([
      ...METRIC_NAMES,
    ]);
    expect(config.metrics[0]).toEqual({
      name: 'speed',
      min: 0,
      max: 90,
      fractionDigits: 0,
    });
  });

  it('rejects a metric name outside the enum', () => {
    expect(() =>
      loadAppConfig(
        validEnv({
          METRIC_DEFS: JSON.stringify([
            { name: 'rpm', min: 0, max: 10, fractionDigits: 0 },
          ]),
        }),
      ),
    ).toThrow(/METRIC_DEFS/);
  });

  it('rejects a publish rate outside the supported range', () => {
    expect(() => loadAppConfig(validEnv({ EVENT_COUNT: '0' }))).toThrow(
      /EVENT_COUNT/,
    );
    expect(() => loadAppConfig(validEnv({ INTERVAL_SECONDS: '0' }))).toThrow(
      /INTERVAL_SECONDS/,
    );
  });
});
