import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isRecord } from '../common/is-record';
import { isMetricName, type MetricName } from '../domain/metric-name';
import type { CompiledRule, RuleSnapshot } from '../domain/rule.interface';
import type { RuleMatcher } from '../domain/rule-matcher.interface';
import { RULE_OPERATORS, type RuleOperator } from '../domain/rule-operator';
import { RedisService } from '../redis/redis.service';
import { RuleIndex } from './rule-index';
import { RuleSeederService } from './rule-seeder.service';
import { RuleEntity, type RuleDocument } from './schemas/rule.schema';

/**
 * قانون‌های روشن را در حافظه نگه می‌دارد تا هر رویداد به پایگاه جستجو نزند.
 * با شروع سرویس، اگر قانون نمونه نباشد ساخته می‌شود و بعد فهرست حافظه پر می‌شود.
 * ساخت، ویرایش یا حذف قانون این فهرست را عوض می‌کند و نسخه تازه را منتشر می‌کند.
 */
@Injectable()
export class RuleCacheService implements RuleMatcher, OnModuleInit {
  private readonly logger = new Logger(RuleCacheService.name);
  private readonly index = new RuleIndex();
  private lastPayload = '';
  private ready: Promise<void> | null = null;

  constructor(
    @InjectModel(RuleEntity.name)
    private readonly rules: Model<RuleDocument>,
    private readonly redis: RedisService,
    private readonly seeder: RuleSeederService,
  ) {}

  onModuleInit(): Promise<void> {
    return this.start();
  }

  start(): Promise<void> {
    this.ready ??= this.bootstrap();
    return this.ready;
  }

  match(metric: MetricName, value: number): readonly CompiledRule[] {
    return this.index.match(metric, value);
  }

  activeCount(): number {
    return this.index.size();
  }

  async reload(): Promise<void> {
    const documents = await this.rules
      .find({ enabled: true })
      .select({ title: 1, metric: 1, operator: 1, value: 1, valueTo: 1 })
      .lean();
    const snapshots = documents.map((document) => ({
      id: String(document._id),
      title: document.title,
      metric: document.metric,
      operator: document.operator,
      value: document.value,
      valueTo: document.valueTo,
    }));
    const payload = JSON.stringify(snapshots);
    this.applyPayload(payload);
    try {
      await this.redis.publishRules(payload);
    } catch (error: unknown) {
      this.logger.error(
        error instanceof Error ? error.message : 'Redis rule publish failed',
      );
    }
  }

  private async bootstrap(): Promise<void> {
    const inserted = await this.seeder.seed();
    if (inserted > 0) {
      this.logger.log(`Inserted ${inserted} rules`);
    }
    await this.reload();
    void this.watchRemote();
  }

  private async watchRemote(): Promise<void> {
    try {
      await this.redis.subscribeRules((payload) => this.applyPayload(payload));
      const current = await this.redis.readRules();
      if (current) {
        this.applyPayload(current);
      }
    } catch (error: unknown) {
      this.logger.error(
        error instanceof Error ? error.message : 'Redis rule subscribe failed',
      );
    }
  }

  private applyPayload(payload: string): void {
    if (payload === this.lastPayload) {
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload) as unknown;
    } catch (error: unknown) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : 'Rule cache payload is invalid',
      );
      return;
    }
    if (!Array.isArray(parsed)) {
      return;
    }
    const snapshots: RuleSnapshot[] = [];
    for (const item of parsed) {
      const snapshot = readSnapshot(item);
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }
    this.index.replace(snapshots);
    this.lastPayload = payload;
  }
}

function readSnapshot(value: unknown): RuleSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, title, metric, operator, value: threshold, valueTo } = value;
  if (typeof id !== 'string' || typeof title !== 'string') {
    return null;
  }
  if (typeof metric !== 'string' || !isMetricName(metric)) {
    return null;
  }
  if (typeof operator !== 'string' || !isOperator(operator)) {
    return null;
  }
  if (typeof threshold !== 'number' || !Number.isFinite(threshold)) {
    return null;
  }
  if (valueTo !== null && typeof valueTo !== 'number') {
    return null;
  }
  return {
    id,
    title,
    metric,
    operator,
    value: threshold,
    valueTo,
  };
}

function isOperator(value: string): value is RuleOperator {
  return (RULE_OPERATORS as readonly string[]).includes(value);
}
