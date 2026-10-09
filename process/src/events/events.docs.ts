import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { EventPageDto } from './dto/event-response.dto';

export const EventsTag = ApiTags('events');

export const listEventsDocs = applyDecorators(
  ApiOperation({
    summary: 'List stored events',
    description:
      'Returns a page of events received from the agent, newest first. Filter by metric name, by the publishing agent instance id, or by both.',
  }),
  ApiOkResponse({
    description: 'One page of stored events that match the filter.',
    type: EventPageDto,
  }),
  ApiBadRequestResponse({
    description: 'The query failed validation.',
    type: ErrorResponseDto,
  }),
);
