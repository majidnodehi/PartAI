export enum RuleOperator {
  GreaterThan = 'gt',
  GreaterThanOrEqual = 'gte',
  LessThan = 'lt',
  LessThanOrEqual = 'lte',
  Equal = 'eq',
  Between = 'between',
}

export const RULE_OPERATORS: readonly RuleOperator[] =
  Object.values(RuleOperator);
