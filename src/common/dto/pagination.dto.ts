import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  readonly limit: number = 10;

  @IsOptional()
  @Min(1)
  @Type(() => Number)
  readonly offset: number = 1;
}
