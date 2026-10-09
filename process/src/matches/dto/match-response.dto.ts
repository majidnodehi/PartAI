import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { EventResponseDto } from '../../events/dto/event-response.dto';
import { RuleSnapshotDto } from '../../rules/dto/rule-response.dto';

@ApiSchema({
  description:
    'A stored match: the publishing agent, the rule at match time, and the event.',
})
export class MatchResponseDto {
  @ApiProperty({
    description: 'MongoDB id of this match.',
    example: '66f0c2b5e1a4c3d2b1a09878',
  })
  id!: string;

  @ApiProperty({
    description: 'Unique id of the agent instance that published the event.',
    example: 'k7m2qx',
  })
  agentInstanceId!: string;

  @ApiProperty({
    description:
      'Id of the rule that matched. The snapshot below stays as it was at match time if the rule is later edited or deleted.',
    example: '66f0c2b5e1a4c3d2b1a09876',
  })
  ruleId!: string;

  @ApiProperty({
    description: 'Copy of the rule fields at the time the event matched.',
    type: RuleSnapshotDto,
  })
  rule!: RuleSnapshotDto;

  @ApiProperty({
    description: 'Stored event that satisfied the rule.',
    type: EventResponseDto,
  })
  event!: EventResponseDto;

  @ApiProperty({
    description: 'When the match was recorded. This is the event receivedAt.',
    type: String,
    format: 'date-time',
    example: '2026-10-08T11:00:00.000Z',
  })
  matchedAt!: Date;
}

@ApiSchema({
  description: 'One page of rule matches, newest first.',
})
export class MatchPageDto {
  @ApiProperty({
    description: 'Matches on this page, newest first.',
    type: [MatchResponseDto],
  })
  items!: MatchResponseDto[];

  @ApiProperty({
    description: 'Number of matches that match the filter, across all pages.',
    example: 1,
  })
  total!: number;

  @ApiProperty({
    description: 'Page number that was returned. The first page is 1.',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Maximum number of matches included in this page.',
    example: 20,
  })
  limit!: number;
}
