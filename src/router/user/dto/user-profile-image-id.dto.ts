import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UserProfileImageIdDto {
  @ApiProperty({ description: '프로필 이미지 아이디' })
  @IsNotEmpty()
  @IsNumberString()
  imageId: string;
}

export class UserProfileImageIdResponseDto extends ResponseBody {
  @ApiProperty()
  data: UserProfileImageIdDto;
}
