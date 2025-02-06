import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UnknownDataBaseError } from '@src/core/module';
import { isNull, isUndefined } from '@src/core/util';
import { NotExistDataError } from '@src/database/type-orm';
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
      throw new UnknownDataBaseError(error);
    }
  }

  private async createChatRoom(orderId: number) {
    if (await this.isExistChatRoom(orderId)) {
      return;
    }
    await new this.model({ roomId: orderId }).save();
  }

  private async isExistChatRoom(orderId: number) {
    const chatRoom = await this.model.exists({ roomId: orderId });

    return !isNull(chatRoom);
  }

  private async insertMessage(orderId: number, messageInfo: MessageInfo) {
    await this.model.updateOne(
      { roomId: orderId },
      {
        $push: {
          messages: messageInfo,
        },
      },
    );
  }

  async findAllMessageByOrderId(orderId: number) {
    const messages = await this.model
      .findOne({ roomId: orderId })
      .select({ messages: { _id: 0 } })
      .select({ _id: 0, roomId: 0, __v: 0 })
      .lean();

    this.validateNull(messages);

    return messages;
  }

  async findRecentMessageByOrderId(roomId: number) {
    try {
      const userMessages = await this.model
        .findOne({ roomId: roomId }, '-messages._id')
        .lean();

      this.validateNull(userMessages);

      const recentMessage = userMessages.messages.pop();

      if (isUndefined(recentMessage)) {
        throw new NotExistDataError('데이터가 존재하지 않습니다.');
      }

      return recentMessage;
    } catch (error) {
      if (error instanceof NotExistDataError) {
        throw new NotExistDataError(
          `${roomId}에 대한 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }
}
