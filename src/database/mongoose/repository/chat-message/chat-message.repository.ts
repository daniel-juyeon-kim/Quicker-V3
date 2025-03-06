import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotExistDataException } from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { isNull, isUndefined } from '@src/core/util';
import { ChatMessageDto } from '@src/router/chat/dto/chat-message.dto';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { ChatMessages, MessageInfo } from '../../models';
import { Transactional } from '../../util/transactional.decorator';
import { MongoRepository } from '../abstract.repository';
import { IChatMessageRepository } from './chat-message.repository.interface';

@Injectable()
export class ChatMessageRepository
  extends MongoRepository
  implements IChatMessageRepository
{
  constructor(
    @InjectModel(ChatMessages.name)
    private readonly model: Model<ChatMessages>,
  ) {
    super();
  }

  @Transactional()
  async saveMessage(orderId: number, messageInfo: MessageInfo) {
    try {
      await this.createChatRoom(orderId);
      await this.insertMessage(orderId, messageInfo);
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }

  private async createChatRoom(orderId: number) {
    if (await this.isExistChatRoom(orderId)) {
      return;
    }
    await new this.model({ id: orderId }).save();
  }

  private async isExistChatRoom(orderId: number) {
    const chatRoom = await this.model.exists({ id: orderId });

    return !isNull(chatRoom);
  }

  private async insertMessage(orderId: number, messageInfo: MessageInfo) {
    await this.model.updateOne(
      { id: orderId },
      {
        $push: {
          messages: messageInfo,
        },
      },
    );
  }

  async findAllMessageByOrderId(orderId: number) {
    try {
      const messages = await this.model
        .findOne({ id: orderId })
        .select({ messages: { _id: 0 } })
        .select({ _id: 0, id: 0, __v: 0 })
        .lean();

      this.validateNull(messages);

      return messages;
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException('orderId', orderId);
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findRecentMessageByOrderId(orderId: number) {
    try {
      const userMessages = await this.model
        .findOne({ id: orderId }, '-messages._id')
        .lean();

      this.validateNull(userMessages);

      const recentMessage = userMessages.messages.pop();

      if (isUndefined(recentMessage)) {
        throw new NotExistDataException('orderId', orderId);
      }

      return plainToInstance(ChatMessageDto, recentMessage);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException('orderId', orderId);
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
