import type { AppConfig } from './app-config.interface';

function readString(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key];
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function readInteger(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = readString(env, key);
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${key} must be an integer from ${min} to ${max}.`);
  }
  return value;
}

function readHttpOrigin(env: NodeJS.ProcessEnv): string {
  const raw = readString(env, 'AGENT_BASE_URL') ?? 'http://127.0.0.1:3000';
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('AGENT_BASE_URL must be an absolute http(s) URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('AGENT_BASE_URL must use http or https.');
  }
  return url.origin;
}

/**
 * تنظیم‌های سرویس پردازش در فایل محیط است.
 * نشانی سرویس عامل، پایگاه داده و حافظه سریع اینجا خوانده می‌شود.
 */
export function loadAppConfig(env: NodeJS.ProcessEnv): AppConfig {
  return Object.freeze({
    port: readInteger(env, 'PORT', 3001, 1, 65535),
    mongoUri:
      readString(env, 'MONGODB_URI') ?? 'mongodb://127.0.0.1:27017/process',
    redisUrl: readString(env, 'REDIS_URL') ?? 'redis://127.0.0.1:6379',
    agentBaseUrl: readHttpOrigin(env),
    redisEventMaxLen: readInteger(
      env,
      'REDIS_EVENT_MAXLEN',
      100_000,
      100,
      1_000_000,
    ),
  });
}
