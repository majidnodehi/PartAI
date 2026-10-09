import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { RulePageDto, RuleResponseDto } from './dto/rule-response.dto';

const ruleId = ApiParam({
  name: 'id',
  description: 'MongoDB id of the rule.',
  example: '66f0c2b5e1a4c3d2b1a09876',
});

const validationFailed = ApiBadRequestResponse({
  description: 'The request failed validation.',
  type: ErrorResponseDto,
});

const ruleMissing = ApiNotFoundResponse({
  description: 'No rule exists with this id.',
  type: ErrorResponseDto,
});

export function RuleDocs(
  summary: string,
  description: string,
): MethodDecorator {
  return applyDecorators(ApiOperation({ summary, description }));
}

export const ruleApi = {
  create: applyDecorators(
    RuleDocs(
      'Create a rule',
      'Stores the rule in MongoDB and reloads the in-memory index. Enabled rules are compared with events received after this change. A between rule is inclusive and requires valueTo to be greater than value. Every other operator stores valueTo as null.',
    ),
    ApiCreatedResponse({
      description: 'The stored rule, including its id and timestamps.',
      type: RuleResponseDto,
    }),
    validationFailed,
  ),
  list: applyDecorators(
    RuleDocs(
      'List rules',
      'Returns a page of rules, most recently updated first. Filter by metric, by whether the rule is enabled, or by both.',
    ),
    ApiOkResponse({
      description: 'One page of rules that match the filter.',
      type: RulePageDto,
    }),
    validationFailed,
  ),
  findOne: applyDecorators(
    RuleDocs('Get a rule', 'Returns one rule by its MongoDB id.'),
    ruleId,
    ApiOkResponse({
      description: 'The requested rule.',
      type: RuleResponseDto,
    }),
    ruleMissing,
  ),
  update: applyDecorators(
    RuleDocs(
      'Update a rule',
      'Changes the fields present in the body and reloads the in-memory index. Omitted fields stay as they are. If the resulting operator is between, valueTo is required and must be greater than value. Any other operator stores valueTo as null.',
    ),
    ruleId,
    ApiOkResponse({
      description: 'The rule after the update.',
      type: RuleResponseDto,
    }),
    validationFailed,
    ruleMissing,
  ),
  remove: applyDecorators(
    RuleDocs(
      'Delete a rule',
      'Removes the rule from MongoDB and reloads the in-memory index. Matches already stored for this rule are kept.',
    ),
    ruleId,
    ApiNoContentResponse({
      description: 'The rule was deleted and the in-memory index was reloaded.',
    }),
    ruleMissing,
  ),
};

export const RulesTag = ApiTags('rules');
