import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MetricNamesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  names?: string;
}
