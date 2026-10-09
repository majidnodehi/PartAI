import type { CompiledRule, RuleSnapshot } from '../domain/rule.interface';
import { RuleOperator } from '../domain/rule-operator';

/** هر قانون یک بار به یک تابع مقایسه تبدیل می‌شود تا بررسی هر رویداد ساده‌تر باشد. */
export function compileRule(rule: RuleSnapshot): CompiledRule {
  const test = predicate(rule);
  return { ...rule, test };
}

function predicate(rule: RuleSnapshot): (value: number) => boolean {
  const min = rule.value;
  const max = rule.valueTo ?? rule.value;
  switch (rule.operator) {
    case RuleOperator.GreaterThan:
      return (value) => value > min;
    case RuleOperator.GreaterThanOrEqual:
      return (value) => value >= min;
    case RuleOperator.LessThan:
      return (value) => value < min;
    case RuleOperator.LessThanOrEqual:
      return (value) => value <= min;
    case RuleOperator.Equal:
      return (value) => value === min;
    case RuleOperator.Between:
      return (value) => value >= min && value <= max;
  }
}
