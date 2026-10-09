import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatusResponseDto } from './dto/status-response.dto';

export const StatusTag = ApiTags('status');

export const statusDocs = applyDecorators(
  ApiOperation({
    summary: 'Get subscription status',
    description:
      'Reports whether the WebSocket to the agent is open, the instance id read from the agent, and how many enabled rules are currently in memory.',
  }),
  ApiOkResponse({
    description: 'The current subscription and the active rule count.',
    type: StatusResponseDto,
  }),
);
