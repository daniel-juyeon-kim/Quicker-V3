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
  @ApiProperty({ description: '참여자 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '참여자 전화번호' })
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

  @ApiProperty({ description: '목적지의 상세 주소' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Participant, description: '수취인 정보' })
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

  @ApiProperty({ description: '출발지의 상세 주소' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Participant, description: '발송인 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Participant)
  sender: Participant;
}

class Product {
  @ApiProperty({ description: '상품의 가로 길이 (cm)' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: '상품의 세로 길이 (cm)' })
  @IsNumber()
  length: number;

  @ApiProperty({ description: '상품의 높이 (cm)' })
  @IsNumber()
  height: number;

  @ApiProperty({ description: '상품의 무게 (kg)' })
  @IsNumber()
  weight: number;
}

export class OrderDetailDto {
  @ApiProperty({ description: '의뢰 ID' })
  @IsPositive()
  id: number;

  @ApiProperty({ description: '의뢰에 대한 추가 세부 정보' })
  @IsString()
  detail: string;

  @ApiProperty({ type: Product, description: '배송할 상품의 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @ApiProperty({ type: Departure, description: '배송 출발지 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Departure)
  departure: Departure;

  @ApiProperty({ type: Destination, description: '배송 목적지 정보' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Destination)
  destination: Destination;
}

export class OrderDetailResponseDto extends ResponseBody {
  @ApiProperty()
  data: OrderDetailDto;
}
