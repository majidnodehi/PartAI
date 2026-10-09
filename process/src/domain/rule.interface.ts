import type { MetricName } from './metric-name';
import type { RuleOperator } from './rule-operator';

export interface RuleSnapshot {
  readonly id: string;
  readonly title: string;
  readonly metric: MetricName;
  readonly operator: RuleOperator;
  readonly value: number;
  readonly valueTo: number | null;
}

export interface CompiledRule extends RuleSnapshot {
  readonly test: (value: number) => boolean;
}

export interface RuleDefinition extends RuleSnapshot {
  readonly enabled: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface RuleDraft {
  readonly title: string;
  readonly metric: MetricName;
  readonly operator: RuleOperator;
  readonly value: number;
  readonly valueTo?: number | null;
  readonly enabled: boolean;
}
