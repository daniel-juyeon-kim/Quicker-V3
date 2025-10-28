import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ description: '메시지를 보낸 사용자의 지갑 주소' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: '채팅 메시지 내용' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: '메시지 발송 시간' })
  @IsDate()
  date: Date;
}

export class ChatMessageResponseDto extends ResponseBody {
  @ApiProperty()
  data: ChatMessageDto;
}
