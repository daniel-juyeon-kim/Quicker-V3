import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { IChatService } from './chat.service.interface';

@Controller('chats')
export class ChatController {
  constructor(
    @Inject(ServiceToken.CHAT_SERVICE)
    private readonly chatService: IChatService,
  ) {}

  @Get(':orderId/recent')
  async findRecentMessage(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.chatService.findRecentMessageByOrderId(orderId);
  }
}
