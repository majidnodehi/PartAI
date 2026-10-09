import { MetricName } from '../domain/metric-name';
import { RuleOperator } from '../domain/rule-operator';
import type { RuleSnapshot } from '../domain/rule.interface';
import { RuleIndex } from './rule-index';

function rule(overrides: Partial<RuleSnapshot> = {}): RuleSnapshot {
  return {
    id: 'rule-1',
    title: 'Hot',
    metric: MetricName.Temperature,
    operator: RuleOperator.GreaterThan,
    value: 80,
    valueTo: null,
    ...overrides,
  };
}

describe('RuleIndex', () => {
  it('checks only the rules for the event metric', () => {
    const index = new RuleIndex();
    index.replace([
      rule(),
      rule({
        id: 'rule-2',
        metric: MetricName.Speed,
        operator: RuleOperator.GreaterThan,
        value: 100,
      }),
    ]);

    expect(
      index.match(MetricName.Temperature, 90).map((hit) => hit.id),
    ).toEqual(['rule-1']);
    expect(index.match(MetricName.Speed, 90)).toEqual([]);
    expect(index.match(MetricName.Voltage, 999)).toEqual([]);
  });

  it('supports each operator and replaces the active set', () => {
    const index = new RuleIndex();
    index.replace([
      rule({ id: 'gt', operator: RuleOperator.GreaterThan, value: 10 }),
      rule({ id: 'gte', operator: RuleOperator.GreaterThanOrEqual, value: 10 }),
      rule({ id: 'lt', operator: RuleOperator.LessThan, value: 10 }),
      rule({ id: 'lte', operator: RuleOperator.LessThanOrEqual, value: 10 }),
      rule({ id: 'eq', operator: RuleOperator.Equal, value: 10 }),
      rule({
        id: 'between',
        operator: RuleOperator.Between,
        value: 5,
        valueTo: 10,
      }),
    ]);

    expect(
      index.match(MetricName.Temperature, 10).map((hit) => hit.id),
    ).toEqual(['gte', 'lte', 'eq', 'between']);

    index.replace([]);
    expect(index.match(MetricName.Temperature, 10)).toEqual([]);
    expect(index.size()).toBe(0);
  });
});
