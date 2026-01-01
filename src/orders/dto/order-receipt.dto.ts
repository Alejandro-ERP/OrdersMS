import { IsString, IsUUID } from 'class-validator';

export class OrderReceiptDto {
  @IsString()
  id: string;

  @IsString()
  @IsUUID()
  orderId: string;

  @IsString()
  receiptUrl: string;
}
