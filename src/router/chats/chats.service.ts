import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { MessageInfo } from '@src/database';
import { IChatMessageRepository } from '@src/database/mongoose/repository/chat-message/chat-message.repository.interface';
import { IChatsService } from './chats.service.interface';

@Injectable()
export class ChatsService implements IChatsService {
  constructor(
    @Inject(RepositoryToken.CHAT_MESSAGE_REPOSITORY)
    private readonly repository: IChatMessageRepository,
  ) {}

  async findRecentMessageByOrderId(orderId: number): Promise<MessageInfo> {
    return await this.repository.findRecentMessageByOrderId(orderId);
  }
}
