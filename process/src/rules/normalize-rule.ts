import { BadRequestException } from '@nestjs/common';
import type { RuleDraft } from '../domain/rule.interface';
import { RuleOperator } from '../domain/rule-operator';

export function normalizeRuleDraft(draft: RuleDraft): RuleDraft {
  const title = draft.title.trim();
  if (title.length === 0) {
    throw new BadRequestException('title is required.');
  }
  if (draft.operator === RuleOperator.Between) {
    if (draft.valueTo === undefined || draft.valueTo === null) {
      throw new BadRequestException(
        'valueTo is required when the operator is between.',
      );
    }
    if (!(draft.valueTo > draft.value)) {
      throw new BadRequestException(
        'valueTo must be greater than value for a between rule.',
      );
    }
    return { ...draft, title, valueTo: draft.valueTo };
  }
  return { ...draft, title, valueTo: null };
}
