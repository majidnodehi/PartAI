import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { MatchPageDto } from './dto/match-response.dto';

export const MatchesTag = ApiTags('matches');

export const listMatchesDocs = applyDecorators(
  ApiOperation({
    summary: 'List rule matches',
    description:
      'Returns a page of matches, newest first. Each item contains the publishing agent instance id, the rule id, a snapshot of the rule at match time, and the event. Later edits or deletion of the rule do not change that snapshot. Filter by agent instance id, by rule id, or by both.',
  }),
  ApiOkResponse({
    description: 'One page of matches that match the filter.',
    type: MatchPageDto,
  }),
  ApiBadRequestResponse({
    description: 'The query failed validation.',
    type: ErrorResponseDto,
  }),
);
