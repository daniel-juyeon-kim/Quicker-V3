import { IsNumber, IsString } from 'class-validator';

export class CreateOrderFailImageDto {
  @IsNumber()
  orderId: number;

  @IsString()
  reason: string;
}
