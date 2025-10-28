import { ApiProperty } from '@nestjs/swagger';
import { IsBuffer } from '@src/core/decorator/validator/is-buffer.decorator';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ImageBufferDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '이미지 파일의 바이너리 버퍼 (JPG, PNG, JPEG 형식만 허용)',
  })
  @Expose()
  @IsNotEmpty()
  @IsBuffer()
  image: Buffer;
}
