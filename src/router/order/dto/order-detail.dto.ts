import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmptyObject,
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class Participant {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsPhoneNumber('KR')
  phone: string;
}

class Destination {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty()
  @IsString()
  detail: string;

  @ApiProperty({ type: Participant })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Participant)
  receiver: Participant;
}

class Departure {
  @ApiProperty()
  @IsString()
  x: number;

  @ApiProperty()
  @IsString()
  y: number;

  @ApiProperty()
  @IsString()
  detail: string;

  @ApiProperty({ type: Participant })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Participant)
  sender: Participant;
}

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

export class OrderDetailDto {
  @ApiProperty()
  @IsPositive()
  id: number;

  @ApiProperty()
  @IsString()
  detail: string;

  @ApiProperty({ type: Product })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Departure })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Departure)
  departure: Departure;

  @ApiProperty({ type: Destination })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Destination)
  destination: Destination;
}
