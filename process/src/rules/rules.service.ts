import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { pageWindow, type Page } from '../domain/page.interface';
import type { RuleDefinition } from '../domain/rule.interface';
import { normalizeRuleDraft } from './normalize-rule';
import { RuleCacheService } from './rule-cache.service';
import type { CreateRuleDto } from './dto/create-rule.dto';
import type { RuleQueryDto } from './dto/rule-query.dto';
import type { UpdateRuleDto } from './dto/update-rule.dto';
import { RuleEntity, type RuleDocument } from './schemas/rule.schema';

/**
 * قانون در پایگاه داده ذخیره می‌شود.
 * بعد از ساخت، ویرایش یا حذف، فهرست حافظه از نو ساخته می‌شود.
 */
@Injectable()
export class RulesService {
  constructor(
    @InjectModel(RuleEntity.name)
    private readonly rules: Model<RuleDocument>,
    private readonly cache: RuleCacheService,
  ) {}

  async create(dto: CreateRuleDto): Promise<RuleDefinition> {
    const draft = normalizeRuleDraft({
      title: dto.title,
      metric: dto.metric,
      operator: dto.operator,
      value: dto.value,
      valueTo: dto.valueTo,
      enabled: dto.enabled ?? true,
    });
    const document = await this.rules.create(draft);
    await this.cache.reload();
    return toDefinition(document);
  }

  async list(query: RuleQueryDto): Promise<Page<RuleDefinition>> {
    const { page, limit, skip } = pageWindow(query.page, query.limit);
    const filter: FilterQuery<RuleEntity> = {};
    if (query.metric) {
      filter.metric = query.metric;
    }
    if (query.enabled !== undefined) {
      filter.enabled = query.enabled;
    }
    const [documents, total] = await Promise.all([
      this.rules
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.rules.countDocuments(filter),
    ]);
    return {
      items: documents.map((document) => ({
        id: String(document._id),
        title: document.title,
        metric: document.metric,
        operator: document.operator,
        value: document.value,
        valueTo: document.valueTo,
        enabled: document.enabled,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<RuleDefinition> {
    return toDefinition(await this.getDocument(id));
  }

  async update(id: string, dto: UpdateRuleDto): Promise<RuleDefinition> {
    const current = await this.getDocument(id);
    const draft = normalizeRuleDraft({
      title: dto.title ?? current.title,
      metric: dto.metric ?? current.metric,
      operator: dto.operator ?? current.operator,
      value: dto.value ?? current.value,
      valueTo: dto.valueTo === undefined ? current.valueTo : dto.valueTo,
      enabled: dto.enabled ?? current.enabled,
    });
    current.title = draft.title;
    current.metric = draft.metric;
    current.operator = draft.operator;
    current.value = draft.value;
    current.valueTo = draft.valueTo ?? null;
    current.enabled = draft.enabled;
    await current.save();
    await this.cache.reload();
    return toDefinition(current);
  }

  async remove(id: string): Promise<void> {
    const document = await this.getDocument(id);
    await document.deleteOne();
    await this.cache.reload();
  }

  private async getDocument(id: string): Promise<RuleDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Rule not found.');
    }
    const document = await this.rules.findById(id);
    if (!document) {
      throw new NotFoundException('Rule not found.');
    }
    return document;
  }
}

function toDefinition(document: RuleDocument): RuleDefinition {
  return {
    id: String(document._id),
    title: document.title,
    metric: document.metric,
    operator: document.operator,
    value: document.value,
    valueTo: document.valueTo,
    enabled: document.enabled,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
