import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ImageBufferDto } from './image-buffer.dto';

export class FindFailDeliveryImageDto extends ImageBufferDto {
  @ApiProperty({ description: '배송 실패 사유' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class FindFailDeliveryImageResponseDto extends ResponseBody {
  @ApiProperty()
  data: FindFailDeliveryImageDto;
}
