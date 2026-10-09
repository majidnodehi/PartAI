import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { PageQueryDto } from './dto/page-query.dto';
import { EventQueryDto } from './events/dto/event-query.dto';
import { MatchQueryDto } from './matches/dto/match-query.dto';
import { RuleQueryDto } from './rules/dto/rule-query.dto';

export function openApiConfig(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('Process')
    .setDescription(
      'Receives telemetry from an agent, stores every event, and evaluates rules against those events. MongoDB keeps events, rules, and matches. Redis keeps a bounded event stream and a copy of the enabled rules. Rule checks use an in-memory index grouped by metric, and that index is replaced whenever a rule is created, updated, or deleted. A match stores the publishing agent instance id, a snapshot of the rule, and the event.',
    )
    .setVersion('0.0.1')
    .addTag('rules', 'Define the comparisons applied to incoming telemetry.')
    .addTag(
      'events',
      'Events received from the agent and stored by this service.',
    )
    .addTag(
      'matches',
      'Records written when an incoming event satisfies a rule.',
    )
    .addTag(
      'status',
      'Connection to the agent and the number of rules currently evaluated.',
    )
    .build();
}

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, openApiConfig(), {
    extraModels: [PageQueryDto, RuleQueryDto, EventQueryDto, MatchQueryDto],
  });
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Process API',
  });
}
