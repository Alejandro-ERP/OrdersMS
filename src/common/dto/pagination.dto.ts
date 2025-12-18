import { Type } from 'class-transformer';
import { IsEnum, IsOptional, Min } from 'class-validator';
import { OrderStatus } from 'src/orders/enum/order-status.enum';

export class PaginationDto {
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  readonly limit: number = 10;

  @IsOptional()
  @Min(1)
  @Type(() => Number)
  readonly offset: number = 1;

  @IsOptional()
  @IsEnum(OrderStatus, {
    message: `status must be a valid OrderStatus value`,
  })
  status: OrderStatus;
}
