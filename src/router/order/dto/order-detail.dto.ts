import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
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
  @ApiProperty({ description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '전화번호' })
  @IsPhoneNumber('KR')
  phone: string;
}

class Destination {
  @ApiProperty({ description: '경도' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsNumber()
  y: number;

  @ApiProperty({ description: '세부 주소' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Participant, description: '수취인' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Participant)
  receiver: Participant;
}

class Departure {
  @ApiProperty({ description: '경도' })
  @IsString()
  x: number;

  @ApiProperty({ description: '위도' })
  @IsString()
  y: number;

  @ApiProperty({ description: '세부주소' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Participant, description: '발송인' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Participant)
  sender: Participant;
}

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

export class OrderDetailDto {
  @ApiProperty({ description: '주문 아이디' })
  @IsPositive()
  id: number;

  @ApiProperty({ description: '세부 정보' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Product, description: '세부 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Departure, description: '출발지' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Departure)
  departure: Departure;

  @ApiProperty({ type: Destination, description: '도착지' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Destination)
  destination: Destination;
}

export class OrderDetailResponseDto extends ResponseBody {
  @ApiProperty()
  data: OrderDetailDto;
}
