import { IsPositive } from 'class-validator';

export class CreateCompleteOrderImageDto {
  @IsPositive()
  orderId: number;
}
