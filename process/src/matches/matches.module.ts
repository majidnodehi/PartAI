import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MATCH_STORE } from '../domain/match-store.interface';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { RuleMatchEntity, RuleMatchSchema } from './schemas/rule-match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RuleMatchEntity.name, schema: RuleMatchSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    { provide: MATCH_STORE, useExisting: MatchesService },
  ],
  exports: [MATCH_STORE, MatchesService],
})
export class MatchesModule {}
