import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

@ApiSchema({
  description: 'Page number and page size shared by the list endpoints.',
})
export class PageQueryDto {
  @ApiPropertyOptional({
    description: 'Page number to return. The first page is 1. Defaults to 1.',
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description:
      'Maximum number of records to return. Defaults to 20 and cannot be greater than 100.',
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
