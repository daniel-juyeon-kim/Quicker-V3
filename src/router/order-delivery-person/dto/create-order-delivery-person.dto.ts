import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateDeliveryPersonLocationDto {
  @ApiProperty({ description: '경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsNumber()
  y: number;
}
