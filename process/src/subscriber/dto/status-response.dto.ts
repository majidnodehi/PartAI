import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description:
    'Whether this service is connected to the agent and how many rules are active.',
})
export class StatusResponseDto {
  @ApiProperty({
    description: 'True while the WebSocket to the agent is open.',
    example: true,
  })
  connected!: boolean;

  @ApiProperty({
    description:
      'Instance id read from the agent diagnostics endpoint. Null until the first successful connection.',
    type: String,
    nullable: true,
    example: 'k7m2qx',
  })
  agentInstanceId!: string | null;

  @ApiProperty({
    description: 'Number of enabled rules currently held in memory.',
    example: 3,
  })
  activeRules!: number;
}
