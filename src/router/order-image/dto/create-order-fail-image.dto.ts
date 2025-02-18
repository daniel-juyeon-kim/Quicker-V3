import { IsPositive, IsString } from 'class-validator';

export class CreateOrderFailImageDto {
  @IsPositive()
  orderId: number;

  @IsString()
  reason: string;
}
