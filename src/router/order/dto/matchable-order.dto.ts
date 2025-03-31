import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { TransportationEntity } from '@src/database';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class Product {
  @ApiProperty({ description: '가로' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: '세로' })
  @IsNumber()
  length: number;

  @ApiProperty({ description: '높이' })
  @IsNumber()
  height: number;

  @ApiProperty({ description: '무게' })
  @IsNumber()
  weight: number;
}

class Transportation {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  walking?: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  bicycle?: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  scooter?: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  bike?: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  car?: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  truck?: true;

  static parseToTransportationDto(
    transportation: Partial<TransportationEntity>,
  ) {
    const dto = new Transportation();
    const TRUE = true;

    const isOne = (value: number) => value === 1;

    for (const key in transportation) {
      if (Object.prototype.hasOwnProperty.call(transportation, key)) {
        if (isOne(transportation[key])) {
          dto[key] = TRUE;
        }
      }
    }

    return dto;
  }
}

class Location {
  @ApiProperty({ description: '경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsNumber()
  y: number;

  @ApiProperty({ description: '세부 정보(동, 호수)' })
  @IsString()
  detail: string;
}

export class MatchableOrderDto {
  @ApiProperty({ description: '주문 아이디' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '세부사항' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Product, description: '상품정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Transportation, description: '운송수단' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Transportation)
  @Transform(({ value }) => Transportation.parseToTransportationDto(value))
  transportation: Transportation;

  @ApiProperty({ type: Location, description: '도착지' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Location)
  destination: Location;

  @ApiProperty({ type: Location, description: '출발지' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Location)
  departure: Location;
}

export class MatchableOrderResponseDto extends ResponseBody {
  @ApiProperty()
  data: MatchableOrderDto;
}
