import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import {
  DenormalOrderEntity,
  TransportationEntity,
  UnmatchedOrderEntity,
} from '@src/database';
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
  @ApiProperty({ description: '물품의 가로 길이 (cm)' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: '물품의 세로 길이 (cm)' })
  @IsNumber()
  length: number;

  @ApiProperty({ description: '물품의 높이 (cm)' })
  @IsNumber()
  height: number;

  @ApiProperty({ description: '물품의 무게 (kg)' })
  @IsNumber()
  weight: number;
}

class Transportation {
  @ApiProperty({ description: '도보 운송 수단 가능 여부', required: false })
  @IsOptional()
  @IsBoolean()
  walking?: true;

  @ApiProperty({ description: '자전거 운송 수단 가능 여부', required: false })
  @IsOptional()
  @IsBoolean()
  bicycle?: true;

  @ApiProperty({ description: '스쿠터 운송 수단 가능 여부', required: false })
  @IsOptional()
  @IsBoolean()
  scooter?: true;

  @ApiProperty({ description: '오토바이 운송 수단 가능 여부', required: false })
  @IsOptional()
  @IsBoolean()
  bike?: true;

  @ApiProperty({ description: '자동차 운송 수단 가능 여부', required: false })
  @IsOptional()
  @IsBoolean()
  car?: true;

  @ApiProperty({ description: '트럭 운송 수단 가능 여부', required: false })
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

  @ApiProperty({ description: '상세 주소 (동, 호수 등)' })
  @IsString()
  detail: string;
}

export class MatchableOrderDto {
  @ApiProperty({ description: '의뢰의 ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '의뢰에 대한 추가 세부 정보' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Product, description: '배송할 물품의 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Transportation, description: '운송 수단 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Transportation)
  @Transform(({ value }) => Transportation.parseToTransportationDto(value))
  transportation: Transportation;

  @ApiProperty({ type: Location, description: '배송 목적지 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Location)
  destination: Location;

  @ApiProperty({ type: Location, description: '배송 출발지 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Location)
  departure: Location;
}

export class MatchableOrderResponseDto extends ResponseBody {
  @ApiProperty()
  data: MatchableOrderDto;
}

export class UnmatchedOrderDto {
  @ApiProperty({ description: '의뢰 ID' })
  id: number;

  @ApiProperty({ description: '의뢰 세부 정보' })
  detail: string;

  @ApiProperty({ type: Product, description: '물품 정보' })
  product: Product;

  @ApiProperty({ type: Transportation, description: '운송 수단 정보' })
  transportation: Transportation;

  @ApiProperty({ type: Location, description: '목적지 정보' })
  destination: Location;

  @ApiProperty({ type: Location, description: '출발지 정보' })
  departure: Location;

  constructor(denomalOrder: UnmatchedOrderEntity | DenormalOrderEntity) {
    this.id = denomalOrder.id;
    this.detail = denomalOrder.detail;
    this.product = {
      width: denomalOrder.width,
      length: denomalOrder.length,
      height: denomalOrder.height,
      weight: denomalOrder.weight,
    };
    this.destination = {
      x: denomalOrder.destinationX,
      y: denomalOrder.destinationY,
      detail: denomalOrder.destinationDetail,
    };
    this.departure = {
      x: denomalOrder.departureX,
      y: denomalOrder.departureY,
      detail: denomalOrder.departureDetail,
    };
    const transportation = Transportation.parseToTransportationDto({
      walking: denomalOrder.walking,
      bicycle: denomalOrder.bicycle,
      scooter: denomalOrder.scooter,
      bike: denomalOrder.bike,
      car: denomalOrder.car,
      truck: denomalOrder.truck,
    });
    this.transportation = transportation;
  }
}
