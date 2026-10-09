import type { CompiledRule } from './rule.interface';
import type { MetricName } from './metric-name';

export interface RuleMatcher {
  match(metric: MetricName, value: number): readonly CompiledRule[];
}

export const RULE_MATCHER = Symbol('RULE_MATCHER');
