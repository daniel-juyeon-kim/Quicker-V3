import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateDeliveryPersonLocationDto {
  @ApiProperty({ description: '배송원의 현재 위치: 경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '배송원의 현재 위치: 위도' })
  @IsNumber()
  y: number;
}
