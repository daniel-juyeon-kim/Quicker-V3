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

export class TransportationDto {
  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @IsNumberEqual(1)
  bicycle?: 1;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @IsNumberEqual(1)
  bike?: 1;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @IsNumberEqual(1)
  car?: 1;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @IsNumberEqual(1)
  scooter?: 1;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @IsNumberEqual(1)
  truck?: 1;

  @ApiProperty({ required: false, example: '1' })
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
  @ApiProperty({ description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '전화번호' })
  @IsPhoneNumber('KR')
  phone: string;
}

class Product {
  @ApiProperty({ description: '가로' })
  @IsPositive()
  width: number;

  @ApiProperty({ description: '세로' })
  @IsPositive()
  length: number;

  @ApiProperty({ description: '높이' })
  @IsPositive()
  height: number;

  @ApiProperty({ description: '무게' })
  @IsPositive()
  weight: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: '지갑주소' })
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({ required: false, description: '주문에 대한 세부 정보' })
  @IsOptional()
  @IsString()
  detail: string | undefined;

  @ApiProperty({
    type: TransportationDto,
    description: '운송 수단, 속성으로 1만 허용됨',
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => TransportationDto)
  @Transform(({ value }) =>
    TransportationDto.parsePartialTransportationEntity(value),
  )
  transportation: TransportationDto;

  @ApiProperty({ type: Product, description: '상품정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Coordinate, description: '목적지' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Coordinate)
  destination: Coordinate;

  @ApiProperty({ type: Coordinate, description: '출발지' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Coordinate)
  departure: Coordinate;

  @ApiProperty({ type: DeliverParticipant, description: '발송인' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => DeliverParticipant)
  sender: DeliverParticipant;

  @ApiProperty({ type: DeliverParticipant, description: '수취인' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => DeliverParticipant)
  receiver: DeliverParticipant;
}
