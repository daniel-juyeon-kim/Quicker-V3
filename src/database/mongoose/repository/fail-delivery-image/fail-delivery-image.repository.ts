import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DuplicatedDataException,
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { FindFailDeliveryImageDto } from '@src/router/order-image/dto/find-fail-image.dto';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
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
    image,
    reason,
  }: {
    orderId: number;
    image: Buffer;
    reason: string;
  }) {
    try {
      const imageModel = new this.model({
        _id: orderId,
        image,
        reason,
      });

      await imageModel.save();
    } catch (error) {
      if (this.isDuplicatedDataError(error)) {
        throw new DuplicatedDataException(orderId);
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findFailDeliveryImageByOrderId(orderId: number) {
    try {
      const failImage = await this.model.findById(orderId);

      this.validateNull(orderId, failImage);

      const plainFailImage: FindFailDeliveryImageDto = failImage;

      return plainToInstance(FindFailDeliveryImageDto, plainFailImage, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
