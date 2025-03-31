import { ApiProperty } from '@nestjs/swagger';
import { IsBuffer } from '@src/core/decorator/validator/is-buffer.decorator';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ImageBufferDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '이미지 버퍼, .jpg .png .jpeg만 가능',
  })
  @Expose()
  @IsNotEmpty()
  @IsBuffer()
  image: Buffer;
}
