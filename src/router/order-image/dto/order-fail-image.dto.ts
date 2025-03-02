import { ApiProperty } from '@nestjs/swagger';
import { IsBuffer } from '@src/core/decorator/validator/is-buffer.decorator';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class BufferImage {
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

export class FailDeliveryImageDto {
  @ApiProperty({ type: BufferImage })
  @Expose()
  @ValidateNested()
  @Type(() => BufferImage)
  image: BufferImage;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  reason: string;
}
