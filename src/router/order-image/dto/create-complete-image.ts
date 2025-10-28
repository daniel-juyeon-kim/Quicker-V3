import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ImageBufferDto } from './image-buffer.dto';

export class CreateCompleteImageDto {
  @ApiProperty({ description: '배송 완료 이미지 파일 (multer를 통해 업로드)' })
  @Expose()
  imageFile: ImageBufferDto;
}
