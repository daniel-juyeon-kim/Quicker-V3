import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { ImageBufferDto } from './image-buffer.dto';

export class CreateFailDeliveryImageDto {
  @ApiProperty({ description: '배송 실패 이미지 파일 (multer를 통해 업로드)' })
  @Expose()
  imageFile: ImageBufferDto;

  @ApiProperty({ description: '배송 실패에 대한 상세 사유' })
  @IsString()
  reason: string;
}

export class CreateFailDeliveryImageResponseDto extends ResponseBody {
  @ApiProperty()
  data: CreateFailDeliveryImageDto;
}
