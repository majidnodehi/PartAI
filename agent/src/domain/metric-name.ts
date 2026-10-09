/** نام‌های مجاز رویداد. سرویس عامل و سرویس پردازش باید همین فهرست را داشته باشند. */
export enum MetricName {
  Speed = 'speed',
  Temperature = 'temperature',
  Voltage = 'voltage',
  Noise = 'noise',
  Pressure = 'pressure',
  Humidity = 'humidity',
  Current = 'current',
  Vibration = 'vibration',
}

export const METRIC_NAMES: readonly MetricName[] = Object.values(MetricName);

export function isMetricName(value: string): value is MetricName {
  return (METRIC_NAMES as readonly string[]).includes(value);
}
