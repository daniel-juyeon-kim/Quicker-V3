import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, ValidateNested } from 'class-validator';

class Location {
  @ApiProperty({ description: '경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsNumber()
  y: number;
}

export class OrderLocationDto {
  @ApiProperty({ description: '주문 아이디' })
  @IsPositive()
  id: number;

  @ApiProperty({ type: Location, description: '출발지 정보' })
  @ValidateNested()
  @Type(() => Location)
  departure: Location;

  @ApiProperty({ type: Location, description: '도착지 정보' })
  @ValidateNested()
  @Type(() => Location)
  destination: Location;
}

export class OrderLocationResponseDto extends ResponseBody {
  @ApiProperty()
  data: OrderLocationDto;
}
