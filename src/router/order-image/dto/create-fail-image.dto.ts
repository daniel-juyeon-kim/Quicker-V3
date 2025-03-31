import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { ImageBufferDto } from './image-buffer.dto';

export class CreateFailDeliveryImageDto {
  @ApiProperty({ description: 'multer 파일' })
  @Expose()
  imageFile: ImageBufferDto;

  @ApiProperty({ description: '배송 실패 사유' })
  @IsString()
  reason: string;
}

export class CreateFailDeliveryImageResponseDto extends ResponseBody {
  @ApiProperty()
  data: CreateFailDeliveryImageDto;
}
