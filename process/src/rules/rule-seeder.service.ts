import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizeRuleDraft } from './normalize-rule';
import { RULE_SEEDS } from './rule.seeds';
import { RuleEntity, type RuleDocument } from './schemas/rule.schema';

@Injectable()
export class RuleSeederService {
  constructor(
    @InjectModel(RuleEntity.name)
    private readonly rules: Model<RuleDocument>,
  ) {}

  async seed(): Promise<number> {
    const drafts = RULE_SEEDS.map((seed) => normalizeRuleDraft(seed));
    const existing = await this.rules
      .find({ title: { $in: drafts.map((draft) => draft.title) } })
      .select({ title: 1 })
      .lean();
    const present = new Set(existing.map((document) => document.title));
    const missing = drafts.filter((draft) => !present.has(draft.title));
    if (missing.length === 0) {
      return 0;
    }
    await this.rules.insertMany(missing);
    return missing.length;
  }
}
