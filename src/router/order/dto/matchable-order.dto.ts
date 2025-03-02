import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @IsNumber()
  width: number;

  @ApiProperty()
  @IsNumber()
  length: number;

  @ApiProperty()
  @IsNumber()
  height: number;

  @ApiProperty()
  @IsNumber()
  weight: number;
}

class Transportation {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  walking: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  bicycle: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  scooter: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  bike: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  car: true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  truck: true;

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
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty()
  @IsString()
  detail: string;
}

export class MatchableOrderDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  detail: string;

  @ApiProperty({ type: Product })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Transportation })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Transportation)
  @Transform(({ value }) => Transportation.parseToTransportationDto(value))
  transportation: Transportation;

  @ApiProperty({ type: Location })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Location)
  destination: Location;

  @ApiProperty({ type: Location })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Location)
  departure: Location;
}
