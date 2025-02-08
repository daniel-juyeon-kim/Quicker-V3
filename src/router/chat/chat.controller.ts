import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { IChatService } from './chat.service.interface';

@Controller('chat')
export class ChatController {
  constructor(
    @Inject(ServiceToken.CHAT_SERVICE)
    private readonly service: IChatService,
  ) {}

  @Get(':roomId/recent-message')
  async getRecentMessage(@Param('roomId', ParseIntPipe) roomId: number) {
    return await this.service.findRecentMessage(roomId);
  }
}
