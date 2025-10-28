import { ApiProperty } from '@nestjs/swagger';
import { IsNumberEqual } from '@src/core/decorator/validator/is-number-equal.decorator';
import { Transform, Type } from 'class-transformer';
import {
  IsEthereumAddress,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import 'reflect-metadata';

export class TransportationDto {
  @ApiProperty({
    description: '자전거 운송 수단 사용 여부 (1: 사용)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumberEqual(1)
  bicycle?: 1;

  @ApiProperty({
    description: '오토바이 운송 수단 사용 여부 (1: 사용)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumberEqual(1)
  bike?: 1;

  @ApiProperty({
    description: '자동차 운송 수단 사용 여부 (1: 사용)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumberEqual(1)
  car?: 1;

  @ApiProperty({
    description: '스쿠터 운송 수단 사용 여부 (1: 사용)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumberEqual(1)
  scooter?: 1;

  @ApiProperty({
    description: '트럭 운송 수단 사용 여부 (1: 사용)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumberEqual(1)
  truck?: 1;

  @ApiProperty({
    description: '도보 운송 수단 사용 여부 (1: 사용)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumberEqual(1)
  walking?: 1;

  static parsePartialTransportationEntity(
    transportation: Partial<Record<keyof TransportationDto, boolean>>,
  ) {
    const dto = new TransportationDto();
    const TRUE = 1;

    const isTrue = (value: undefined | true | false) => value === true;

    for (const key in transportation) {
      if (Object.prototype.hasOwnProperty.call(transportation, key)) {
        if (isTrue(transportation[key])) {
          dto[key] = TRUE;
        }
      }
    }

    return dto;
  }
}

class Coordinate {
  @ApiProperty({ description: '경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsNumber()
  y: number;
}

class DeliverParticipant {
  @ApiProperty({ description: '참여자 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '참여자 전화번호' })
  @IsPhoneNumber('KR')
  phone: string;
}

class Product {
  @ApiProperty({ description: '상품의 가로 길이 (cm)' })
  @IsPositive()
  width: number;

  @ApiProperty({ description: '상품의 세로 길이 (cm)' })
  @IsPositive()
  length: number;

  @ApiProperty({ description: '상품의 높이 (cm)' })
  @IsPositive()
  height: number;

  @ApiProperty({ description: '상품의 무게 (kg)' })
  @IsPositive()
  weight: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: '의뢰인의 지갑 주소' })
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({ description: '의뢰에 대한 추가 세부 정보', required: false })
  @IsOptional()
  @IsString()
  detail: string | undefined;

  @ApiProperty({
    type: TransportationDto,
    description: '의뢰에 필요한 운송 수단 정보',
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => TransportationDto)
  @Transform(({ value }) =>
    TransportationDto.parsePartialTransportationEntity(value),
  )
  transportation: TransportationDto;

  @ApiProperty({ type: Product, description: '배송할 상품의 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Coordinate, description: '배송 목적지 좌표' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Coordinate)
  destination: Coordinate;

  @ApiProperty({ type: Coordinate, description: '배송 출발지 좌표' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Coordinate)
  departure: Coordinate;

  @ApiProperty({ type: DeliverParticipant, description: '발송인 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => DeliverParticipant)
  sender: DeliverParticipant;

  @ApiProperty({ type: DeliverParticipant, description: '수취인 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => DeliverParticipant)
  receiver: DeliverParticipant;
}
