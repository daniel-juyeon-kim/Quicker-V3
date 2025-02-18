import { IsNumber, IsPositive } from 'class-validator';

export class CreateDeliveryPersonLocationDto {
  @IsPositive()
  orderId: number;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}
