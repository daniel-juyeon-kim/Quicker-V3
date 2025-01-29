import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UnknownDataBaseError } from '@src/core';
import { isNull, isUndefined } from '@src/core/util';
import { NotExistDataError } from '@src/database/type-orm';
import { Model } from 'mongoose';
import { ChatMessage } from '../../models';
import { MongoRepository } from '../abstract.repository';

@Injectable()
export class ChatMessageRepository extends MongoRepository {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly model: Model<ChatMessage>,
  ) {
    super();
  }

  async saveMessage(
    orderId: number,
    {
      walletAddress,
      message,
      date,
    }: { walletAddress: string; message: string; date: Date },
  ) {
    try {
      await this.createChatRoom(orderId);
      await this.insertMessage(orderId, { walletAddress, message, date });
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

  private async insertMessage(
    orderId: number,
    {
      walletAddress,
      message,
      date,
    }: {
      walletAddress: string;
      message: string;
      date: Date;
    },
  ) {
    await this.model.updateOne(
      { roomId: orderId },
      { $push: { messages: { walletAddress, message, date } } },
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
