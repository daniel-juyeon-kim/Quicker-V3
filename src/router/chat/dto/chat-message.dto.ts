import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsDate()
  date: Date;
}
