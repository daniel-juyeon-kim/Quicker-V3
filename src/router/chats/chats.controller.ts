import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { IChatsService } from './chats.service.interface';

@Controller('chats')
export class ChatsController {
  constructor(
    @Inject(ServiceToken.CHAT_SERVICE)
    private readonly service: IChatsService,
  ) {}

  @Get(':orderId/recent')
  async findRecentMessage(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.service.findRecentMessageByOrderId(orderId);
  }
}
