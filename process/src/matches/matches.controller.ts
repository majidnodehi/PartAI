import { Controller, Get, Query } from '@nestjs/common';
import type { Page } from '../domain/page.interface';
import type { RuleMatchRecord } from '../domain/rule-match.interface';
import { MatchQueryDto } from './dto/match-query.dto';
import { listMatchesDocs, MatchesTag } from './matches.docs';
import { MatchesService } from './matches.service';

@MatchesTag
@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get()
  @listMatchesDocs
  list(@Query() query: MatchQueryDto): Promise<Page<RuleMatchRecord>> {
    return this.matches.list(query);
  }
}
