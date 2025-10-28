import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';

import { Type } from 'class-transformer';
import {
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class Phone {
  @ApiProperty({ description: '전화번호' })
  @IsPhoneNumber('KR')
  phone: string;
}

class Departure {
  @ApiProperty({ description: '경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsNumber()
  y: number;

  @ApiProperty({ description: '발송인 전화번호', type: Phone })
  @ValidateNested()
  @Type(() => Phone)
  sender: Phone;
}

class Destination {
  @ApiProperty({ description: '경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsNumber()
  y: number;

  @ApiProperty({ description: '수취인 전화번호', type: Phone })
  @ValidateNested()
  @Type(() => Phone)
  receiver: Phone;
}

export class OrderSenderReceiverDto {
  @ApiProperty({ description: '의뢰 ID' })
  @IsPositive()
  id: number;

  @ApiProperty({ type: Departure, description: '출발지 좌표 및 발송인 정보' })
  @ValidateNested()
  @Type(() => Departure)
  departure: Departure;

  @ApiProperty({ type: Destination, description: '도착지 좌표 및 수취인 정보' })
  @ValidateNested()
  @Type(() => Destination)
  destination: Destination;
}

export class OrderSenderReceiverResponseDto extends ResponseBody {
  @ApiProperty()
  data: OrderSenderReceiverDto;
}
