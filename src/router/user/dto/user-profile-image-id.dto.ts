import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UserProfileImageIdDto {
  @ApiProperty({ description: '조회된 사용자의 프로필 이미지 ID' })
  @IsNotEmpty()
  @IsNumberString()
  imageId: string;
}

export class UserProfileImageIdResponseDto extends ResponseBody {
  @ApiProperty()
  data: UserProfileImageIdDto;
}
