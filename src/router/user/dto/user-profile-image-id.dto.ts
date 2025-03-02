import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UserProfileImageIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  imageId: string;
}
