import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class Phone {
  @ApiProperty()
  @IsPhoneNumber('KR')
  phone: string;
}

class Departure {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty({ type: Phone })
  @ValidateNested()
  @Type(() => Phone)
  sender: Phone;
}

class Destination {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty({ type: Phone })
  @ValidateNested()
  @Type(() => Phone)
  receiver: Phone;
}

export class OrderSenderReceiverDto {
  @ApiProperty()
  @IsPositive()
  id: number;

  @ApiProperty({ type: Departure })
  @ValidateNested()
  @Type(() => Departure)
  departure: Departure;

  @ApiProperty({ type: Destination })
  @ValidateNested()
  @Type(() => Destination)
  destination: Destination;
}
