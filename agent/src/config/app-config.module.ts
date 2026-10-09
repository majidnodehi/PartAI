import { Global, Module } from '@nestjs/common';
import { APP_CONFIG } from './app-config.interface';
import type { AppConfig } from './app-config.interface';
import { loadAppConfig } from './load-app-config';
import { loadEnv } from './load-env';

function loadConfigOrExit(): AppConfig {
  loadEnv();
  try {
    return loadAppConfig(process.env);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Invalid configuration';
    console.error(message);
    process.exit(1);
  }
}

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: loadConfigOrExit,
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
