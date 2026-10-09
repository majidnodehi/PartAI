import { Inject, Injectable } from '@nestjs/common';
import { MATCH_STORE } from '../domain/match-store.interface';
import type { MatchStore } from '../domain/match-store.interface';
import { RULE_MATCHER } from '../domain/rule-matcher.interface';
import type { RuleMatcher } from '../domain/rule-matcher.interface';
import type { StoredEvent } from '../domain/telemetry-event.interface';

/**
 * اگر یک یا چند قانون با رویداد جور باشد، برای هر کدام یک سند نتیجه نوشته می‌شود.
 * سند، شناسه سرویس عامل، رونوشت قانون در همان لحظه، و خود رویداد را نگه می‌دارد.
 * ویرایش بعدی قانون، نتیجه‌های قبلی را عوض نمی‌کند.
 */
@Injectable()
export class RuleEvaluationHandler {
  constructor(
    @Inject(RULE_MATCHER) private readonly matcher: RuleMatcher,
    @Inject(MATCH_STORE) private readonly matches: MatchStore,
  ) {}

  async handle(event: StoredEvent): Promise<number> {
    const hits = this.matcher.match(event.name, event.value);
    if (hits.length === 0) {
      return 0;
    }
    await this.matches.saveAll(
      hits.map((rule) => ({
        agentInstanceId: event.agentInstanceId,
        ruleId: rule.id,
        rule: {
          id: rule.id,
          title: rule.title,
          metric: rule.metric,
          operator: rule.operator,
          value: rule.value,
          valueTo: rule.valueTo,
        },
        event,
        matchedAt: event.receivedAt,
      })),
    );
    return hits.length;
  }
}
