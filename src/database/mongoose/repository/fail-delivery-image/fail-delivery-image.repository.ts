import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UnknownDataBaseError } from '@src/core/module';
import { Model } from 'mongoose';
import { DuplicatedDataError, NotExistDataError } from '../../../type-orm';
import { FailDeliveryImage } from '../../models';
import { MongoRepository } from '../abstract.repository';
import { IFailDeliveryImageRepository } from './fail-delivery-image.repository.interface';

@Injectable()
export class FailDeliveryImageRepository
  extends MongoRepository
  implements IFailDeliveryImageRepository
{
  constructor(
    @InjectModel(FailDeliveryImage.name)
    private readonly model: Model<FailDeliveryImage>,
  ) {
    super();
  }

  async createFailDeliveryImage({
    orderId,
    bufferImage,
    reason,
  }: {
    orderId: number;
    bufferImage: Buffer;
    reason: string;
  }) {
    try {
      const image = new this.model({
        _id: orderId,
        image: bufferImage,
        reason,
      });

      await image.save();
    } catch (error) {
      if (this.isDuplicatedDataError(error)) {
        throw new DuplicatedDataError(
          `${orderId}에 해당되는 데이터가 이미 존재합니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }

  async findFailDeliveryImageByOrderId(orderId: number) {
    try {
      const image = await this.model.findById(orderId);

      this.validateNull(image);

      return image;
    } catch (error) {
      if (error instanceof NotExistDataError) {
        throw new NotExistDataError(
          `${orderId}에 해당되는 실패 이미지가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }
}
