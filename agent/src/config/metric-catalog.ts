import type { MetricDefinition } from '../domain/metric-definition.interface';
import { METRIC_NAMES, MetricName } from '../domain/metric-name';

/**
 * Ranges only shape generated samples.
 * Alert rules stay in the subscriber services, which match on `name`.
 * Units implied by name: speed km/h, temperature C, voltage V, noise dB,
 * pressure hPa, humidity %, current A, vibration mm/s.
 */
const RANGES: Record<
  MetricName,
  Pick<MetricDefinition, 'min' | 'max' | 'fractionDigits'>
> = {
  [MetricName.Speed]: { min: 0, max: 180, fractionDigits: 1 },
  [MetricName.Temperature]: { min: -20, max: 120, fractionDigits: 2 },
  [MetricName.Voltage]: { min: 0, max: 240, fractionDigits: 2 },
  [MetricName.Noise]: { min: 30, max: 120, fractionDigits: 1 },
  [MetricName.Pressure]: { min: 900, max: 1100, fractionDigits: 1 },
  [MetricName.Humidity]: { min: 0, max: 100, fractionDigits: 1 },
  [MetricName.Current]: { min: 0, max: 30, fractionDigits: 2 },
  [MetricName.Vibration]: { min: 0, max: 20, fractionDigits: 3 },
};

export function metricCatalog(): readonly MetricDefinition[] {
  return Object.freeze(
    METRIC_NAMES.map((name) =>
      Object.freeze({
        name,
        min: RANGES[name].min,
        max: RANGES[name].max,
        fractionDigits: RANGES[name].fractionDigits,
      }),
    ),
  );
}
