import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import type { NextFunction, Request, Response } from 'express';
import { APP_CONFIG } from './config/app-config.interface';
import type { AppConfig } from './config/app-config.interface';

export function configureApp(app: INestApplication): AppConfig {
  const config = app.get<AppConfig>(APP_CONFIG);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    exposedHeaders: ['X-Agent-Instance-Id'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Agent-Instance-Id', config.instanceId);
    next();
  });
  return config;
}
