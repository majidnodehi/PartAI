import { isRecord } from '../common/is-record';
import type { MetricDefinition } from '../domain/metric-definition.interface';
import {
  isMetricName,
  METRIC_NAMES,
  type MetricName,
} from '../domain/metric-name';
import type { AppConfig } from './app-config.interface';
import { metricCatalog } from './metric-catalog';

const INSTANCE_ID_PATTERN = /^[a-z0-9]{4,12}$/;
const WS_PATH_PATTERN = /^\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*$/;

function readString(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key];
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function readNumber(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = readString(env, key);
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${key} must be a number from ${min} to ${max}.`);
  }
  return value;
}

function readInteger(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = readNumber(env, key, fallback, min, max);
  if (!Number.isInteger(value)) {
    throw new Error(`${key} must be an integer.`);
  }
  return value;
}

function readInstanceId(env: NodeJS.ProcessEnv): string {
  const instanceId = readString(env, 'AGENT_INSTANCE_ID');
  if (!instanceId || !INSTANCE_ID_PATTERN.test(instanceId)) {
    throw new Error(
      'AGENT_INSTANCE_ID must be 4-12 lowercase letters or digits, for example k7m2qx.',
    );
  }
  return instanceId;
}

export function readWsPath(env: NodeJS.ProcessEnv): string {
  const wsPath = readString(env, 'WS_PATH') ?? '/events';
  if (!WS_PATH_PATTERN.test(wsPath)) {
    throw new Error('WS_PATH must look like /events.');
  }
  return wsPath;
}

function readFractionDigits(value: unknown, name: string): number {
  const fractionDigits = value === undefined ? 2 : value;
  if (
    typeof fractionDigits !== 'number' ||
    !Number.isInteger(fractionDigits) ||
    fractionDigits < 0 ||
    fractionDigits > 8
  ) {
    throw new Error(
      `METRIC_DEFS fractionDigits for "${name}" must be an integer from 0 to 8.`,
    );
  }
  return fractionDigits;
}

function parseMetricDefinition(value: unknown): MetricDefinition {
  if (!isRecord(value)) {
    throw new Error('METRIC_DEFS entries must be objects.');
  }
  const name: unknown = value.name;
  if (typeof name !== 'string' || !isMetricName(name)) {
    throw new Error(
      `METRIC_DEFS name must be one of: ${METRIC_NAMES.join(', ')}.`,
    );
  }
  const { min, max } = value;
  if (
    typeof min !== 'number' ||
    typeof max !== 'number' ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    !(max > min)
  ) {
    throw new Error(`METRIC_DEFS range for "${name}" must have min < max.`);
  }
  return Object.freeze({
    name,
    min,
    max,
    fractionDigits: readFractionDigits(value.fractionDigits, name),
  });
}

function applyRangeOverrides(
  overrides: readonly MetricDefinition[],
): readonly MetricDefinition[] {
  const byName = new Map<MetricName, MetricDefinition>(
    overrides.map((metric) => [metric.name, metric]),
  );
  return Object.freeze(
    metricCatalog().map((metric) => byName.get(metric.name) ?? metric),
  );
}

function parseMetricDefs(raw: string): readonly MetricDefinition[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error('METRIC_DEFS must be valid JSON.');
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('METRIC_DEFS must be a non-empty JSON array.');
  }
  const seen = new Set<string>();
  const metrics = parsed.map((entry: unknown) => {
    const metric = parseMetricDefinition(entry);
    if (seen.has(metric.name)) {
      throw new Error(`METRIC_DEFS lists "${metric.name}" more than once.`);
    }
    seen.add(metric.name);
    return metric;
  });
  return Object.freeze(metrics);
}

function readMetrics(env: NodeJS.ProcessEnv): readonly MetricDefinition[] {
  const rawDefs = readString(env, 'METRIC_DEFS');
  if (!rawDefs) {
    return metricCatalog();
  }
  return applyRangeOverrides(parseMetricDefs(rawDefs));
}

/**
 * تنظیم‌های قابل تغییر سرویس عامل در فایل محیط است.
 * شناسه یکتا همان مقداری است که سرویس پردازش هنگام تطبیق قانون ذخیره می‌کند.
 * تعداد رویداد و طول بازه زمانی، سرعت تولید را مشخص می‌کنند.
 */
export function loadAppConfig(env: NodeJS.ProcessEnv): AppConfig {
  return Object.freeze({
    instanceId: readInstanceId(env),
    port: readInteger(env, 'PORT', 3000, 1, 65535),
    eventCount: readInteger(env, 'EVENT_COUNT', 5, 1, 100),
    intervalSeconds: readInteger(env, 'INTERVAL_SECONDS', 1, 1, 3600),
    eventBufferSize: readInteger(env, 'EVENT_BUFFER_SIZE', 512, 1, 10_000),
    wsPath: readWsPath(env),
    metrics: readMetrics(env),
    logEverySeconds: readInteger(env, 'LOG_EVERY_SECONDS', 30, 0, 3600),
    maxBufferedBytes: readInteger(
      env,
      'MAX_BUFFERED_BYTES',
      1_048_576,
      1024,
      16_777_216,
    ),
  });
}
