import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RULE_MATCHER } from '../domain/rule-matcher.interface';
import { MatchesModule } from '../matches/matches.module';
import { RuleCacheService } from './rule-cache.service';
import { RuleSeederService } from './rule-seeder.service';
import { RuleEvaluationHandler } from './rule-evaluation.handler';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { RuleEntity, RuleSchema } from './schemas/rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RuleEntity.name, schema: RuleSchema }]),
    MatchesModule,
  ],
  controllers: [RulesController],
  providers: [
    RulesService,
    RuleSeederService,
    RuleCacheService,
    RuleEvaluationHandler,
    { provide: RULE_MATCHER, useExisting: RuleCacheService },
  ],
  exports: [RuleCacheService, RuleEvaluationHandler, RULE_MATCHER],
})
export class RulesModule {}
