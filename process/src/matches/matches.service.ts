import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import type { MatchStore } from '../domain/match-store.interface';
import type {
  NewRuleMatch,
  RuleMatchRecord,
} from '../domain/rule-match.interface';
import { pageWindow, type Page } from '../domain/page.interface';
import type { MatchQueryDto } from './dto/match-query.dto';
import {
  RuleMatchEntity,
  type RuleMatchDocument,
} from './schemas/rule-match.schema';

@Injectable()
export class MatchesService implements MatchStore {
  constructor(
    @InjectModel(RuleMatchEntity.name)
    private readonly matches: Model<RuleMatchDocument>,
  ) {}

  async saveAll(matches: readonly NewRuleMatch[]): Promise<void> {
    if (matches.length === 0) {
      return;
    }
    await this.matches.insertMany(matches);
  }

  async list(query: MatchQueryDto): Promise<Page<RuleMatchRecord>> {
    const { page, limit, skip } = pageWindow(query.page, query.limit);
    const filter: FilterQuery<RuleMatchEntity> = {};
    if (query.agentInstanceId) {
      filter.agentInstanceId = query.agentInstanceId;
    }
    if (query.ruleId) {
      filter.ruleId = query.ruleId;
    }
    const [documents, total] = await Promise.all([
      this.matches
        .find(filter)
        .sort({ matchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.matches.countDocuments(filter),
    ]);
    return {
      items: documents.map((document) => ({
        id: String(document._id),
        agentInstanceId: document.agentInstanceId,
        ruleId: document.ruleId,
        rule: document.rule,
        event: {
          ...document.event,
          receivedAt: new Date(document.event.receivedAt),
        },
        matchedAt: document.matchedAt,
      })),
      total,
      page,
      limit,
    };
  }
}
