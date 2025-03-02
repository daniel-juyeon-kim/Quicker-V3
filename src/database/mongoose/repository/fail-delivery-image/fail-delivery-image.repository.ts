import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UnknownDataBaseException } from '@src/core/module';
import { FailDeliveryImageDto } from '@src/router/order-image/dto/order-fail-image.dto';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '../../../type-orm';
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
        throw new DuplicatedDataException(
          `${orderId}에 해당되는 데이터가 이미 존재합니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findFailDeliveryImageByOrderId(orderId: number) {
    try {
      const failImage = await this.model.findById(orderId);

      this.validateNull(failImage);

      const convertedFailImage = failImage.toJSON();

      return plainToInstance(FailDeliveryImageDto, convertedFailImage, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException(
          `${orderId}에 해당되는 실패 이미지가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
