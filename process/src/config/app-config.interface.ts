export interface AppConfig {
  readonly port: number;
  readonly mongoUri: string;
  readonly redisUrl: string;
  readonly agentBaseUrl: string;
  readonly redisEventMaxLen: number;
}

export const APP_CONFIG = Symbol('APP_CONFIG');
