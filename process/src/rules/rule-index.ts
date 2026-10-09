import type { CompiledRule, RuleSnapshot } from '../domain/rule.interface';
import type { MetricName } from '../domain/metric-name';
import { compileRule } from './rule-compiler';

/**
 * قانون‌ها بر اساس سنجه گروه‌بندی می‌شوند.
 * رویداد دما فقط قانون‌های دما را می‌بیند، نه همه قانون‌ها را.
 */
export class RuleIndex {
  private snapshot: ReadonlyMap<MetricName, readonly CompiledRule[]> =
    new Map();

  replace(rules: readonly RuleSnapshot[]): void {
    const grouped = new Map<MetricName, CompiledRule[]>();
    for (const rule of rules) {
      const compiled = compileRule(rule);
      const bucket = grouped.get(rule.metric);
      if (bucket) {
        bucket.push(compiled);
      } else {
        grouped.set(rule.metric, [compiled]);
      }
    }
    this.snapshot = grouped;
  }

  match(metric: MetricName, value: number): readonly CompiledRule[] {
    const bucket = this.snapshot.get(metric);
    if (!bucket || bucket.length === 0) {
      return [];
    }
    const hits: CompiledRule[] = [];
    for (let index = 0; index < bucket.length; index += 1) {
      const rule = bucket[index];
      if (rule.test(value)) {
        hits.push(rule);
      }
    }
    return hits;
  }

  size(): number {
    let count = 0;
    for (const bucket of this.snapshot.values()) {
      count += bucket.length;
    }
    return count;
  }
}
