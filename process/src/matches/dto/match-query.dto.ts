import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PageQueryDto } from '../../dto/page-query.dto';

@ApiSchema({
  description: 'Filters and paging for rule matches.',
})
export class MatchQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    description: 'Return only matches for events from this agent instance.',
    maxLength: 32,
    example: 'k7m2qx',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  agentInstanceId?: string;

  @ApiPropertyOptional({
    description: 'Return only matches produced by this rule id.',
    maxLength: 32,
    example: '66f0c2b5e1a4c3d2b1a09876',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  ruleId?: string;
}
