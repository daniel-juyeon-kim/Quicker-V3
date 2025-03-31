import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserNameDto {
  @ApiProperty({ description: '사용자 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UserNameResponseDto extends ResponseBody {
  @ApiProperty()
  data: UserNameDto;
}
