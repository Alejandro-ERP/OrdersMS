import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsUUID(4)
  id: string;

  @IsOptional()
  @IsEnum(OrderStatus, {
    message: `Status must be one of the following values: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus = OrderStatus.PENDING;
}
