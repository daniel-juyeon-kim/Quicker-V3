import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: '프로필 이미지 아이디' })
  @IsNotEmpty()
  @IsNumberString()
  imageId: string;
}
