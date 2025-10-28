import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { IsNumber } from 'class-validator';

export class OrderAverageCostDto {
  @ApiProperty({ description: '평균 의뢰 금액' })
  @IsNumber()
  averageCost: number;
}

export class OrderAverageCostResponseDto extends ResponseBody {
  @ApiProperty()
  data: OrderAverageCostDto;
}
