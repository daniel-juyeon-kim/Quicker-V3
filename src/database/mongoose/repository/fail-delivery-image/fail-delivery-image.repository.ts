import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { FailDeliveryImageDto } from '@src/router/order-image/dto/order-fail-image.dto';
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
        throw new DuplicatedDataException('orderId', orderId);
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
        throw new NotExistDataException('orderId', orderId);
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
