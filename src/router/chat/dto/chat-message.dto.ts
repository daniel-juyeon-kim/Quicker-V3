import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ description: '지갑주소' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: '메시지' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: '메시지 발송 날자' })
  @IsDate()
  date: Date;
}

export class ChatMessageResponseDto extends ResponseBody {
  @ApiProperty()
  data: ChatMessageDto;
}
