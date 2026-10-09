import { MetricName } from '../domain/metric-name';
import type { RuleDraft } from '../domain/rule.interface';
import { RuleOperator } from '../domain/rule-operator';

export const RULE_SEEDS: readonly RuleDraft[] = [
  {
    title: 'High speed',
    metric: MetricName.Speed,
    operator: RuleOperator.GreaterThan,
    value: 120,
    enabled: true,
  },
  {
    title: 'Freezing',
    metric: MetricName.Temperature,
    operator: RuleOperator.LessThan,
    value: 0,
    enabled: true,
  },
  {
    title: 'High temperature',
    metric: MetricName.Temperature,
    operator: RuleOperator.GreaterThanOrEqual,
    value: 80,
    enabled: true,
  },
  {
    title: 'High line voltage',
    metric: MetricName.Voltage,
    operator: RuleOperator.Between,
    value: 220,
    valueTo: 240,
    enabled: true,
  },
  {
    title: 'Loud',
    metric: MetricName.Noise,
    operator: RuleOperator.GreaterThanOrEqual,
    value: 90,
    enabled: true,
  },
  {
    title: 'Low pressure',
    metric: MetricName.Pressure,
    operator: RuleOperator.LessThanOrEqual,
    value: 980,
    enabled: true,
  },
  {
    title: 'High humidity',
    metric: MetricName.Humidity,
    operator: RuleOperator.GreaterThan,
    value: 70,
    enabled: true,
  },
  {
    title: 'High current',
    metric: MetricName.Current,
    operator: RuleOperator.GreaterThan,
    value: 20,
    enabled: true,
  },
  {
    title: 'Strong vibration',
    metric: MetricName.Vibration,
    operator: RuleOperator.GreaterThanOrEqual,
    value: 10,
    enabled: true,
  },
  {
    title: 'Stopped',
    metric: MetricName.Speed,
    operator: RuleOperator.Equal,
    value: 0,
    enabled: false,
  },
];
