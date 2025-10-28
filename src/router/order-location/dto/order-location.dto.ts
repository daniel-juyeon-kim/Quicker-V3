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
  @ApiProperty({ description: '의뢰 ID' })
  @IsPositive()
  id: number;

  @ApiProperty({ type: Location, description: '배송 출발지 좌표 정보' })
  @ValidateNested()
  @Type(() => Location)
  departure: Location;

  @ApiProperty({ type: Location, description: '배송 목적지 좌표 정보' })
  @ValidateNested()
  @Type(() => Location)
  destination: Location;
}

export class OrderLocationResponseDto extends ResponseBody {
  @ApiProperty()
  data: OrderLocationDto;
}
