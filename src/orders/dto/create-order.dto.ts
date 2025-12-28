import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsString()
  currency: string;
  
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  @ValidateNested({ each: true })
  items: OrderItemDto[];
}
