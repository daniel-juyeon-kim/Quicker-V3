import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: '업데이트할 프로필 이미지의 ID' })
  @IsNotEmpty()
  @IsNumberString()
  imageId: string;
}
