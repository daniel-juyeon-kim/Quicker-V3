import { IsNumberEqual } from '@src/core/decorator/validator/is-number-equal/is-number-equal.decorator';
import { Transform, Type } from 'class-transformer';
import {
  IsEthereumAddress,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TransportationDto {
  @IsOptional()
  @IsNumberEqual(1)
  bicycle?: 1;

  @IsOptional()
  @IsNumberEqual(1)
  bike?: 1;

  @IsOptional()
  @IsNumberEqual(1)
  car?: 1;

  @IsOptional()
  @IsNumberEqual(1)
  scooter?: 1;

  @IsOptional()
  @IsNumberEqual(1)
  truck?: 1;

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
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

class DeliverParticipant {
  @IsString()
  name: string;

  @IsPhoneNumber('KR')
  phone: string;
}

class Product {
  @IsNumber()
  width: number;

  @IsNumber()
  length: number;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;
}

export class CreateOrderDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsOptional()
  @IsString()
  detail: string | undefined;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => TransportationDto)
  @Transform(({ value }) =>
    TransportationDto.parsePartialTransportationEntity(value),
  )
  transportation: TransportationDto;

  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ValidateNested()
  @Type(() => Coordinate)
  destination: Coordinate;

  @ValidateNested()
  @Type(() => Coordinate)
  departure: Coordinate;

  @ValidateNested()
  @Type(() => DeliverParticipant)
  sender: DeliverParticipant;

  @ValidateNested()
  @Type(() => DeliverParticipant)
  receiver: DeliverParticipant;
}
