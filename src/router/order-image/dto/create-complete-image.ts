import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ImageBufferDto } from './image-buffer.dto';

export class CreateCompleteImageDto {
  @ApiProperty({ description: 'multer 파일' })
  @Expose()
  imageFile: ImageBufferDto;
}
