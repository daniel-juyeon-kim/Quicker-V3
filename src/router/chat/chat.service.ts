import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IChatMessageRepository } from '@src/database/mongoose/repository/chat-message/chat-message.repository.interface';

@Injectable()
export class ChatService {
  constructor(
    @Inject(RepositoryToken.CHAT_MESSAGE_REPOSITORY)
    private readonly repository: IChatMessageRepository,
  ) {}

  async findRecentMessage(roomId: number) {
    return await this.repository.findRecentMessageByOrderId(roomId);
  }
}
