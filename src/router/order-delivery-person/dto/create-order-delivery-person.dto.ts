import { IsNumber } from 'class-validator';

export class CreateDeliveryPersonLocationDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}
