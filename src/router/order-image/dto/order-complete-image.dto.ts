import { ApiProperty } from '@nestjs/swagger';
import { IsBuffer } from '@src/core/decorator/validator/is-buffer.decorator';

import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class OrderCompleteImageDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsBuffer()
  data: Buffer;

  @ApiProperty()
  @Expose()
  @IsString()
  type: 'Buffer';
}
