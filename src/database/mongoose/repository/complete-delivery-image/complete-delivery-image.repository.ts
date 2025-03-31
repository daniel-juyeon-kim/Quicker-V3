import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DuplicatedDataException,
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { FindCompleteDeliveryImageDto } from '@src/router/order-image/dto/find-complete-image.dto';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { CompleteDeliveryImage } from '../../models/complete-delivery-image';
import { MongoRepository } from '../abstract.repository';
import { ICompleteDeliveryImageRepository } from './complete-delivery-image.repository.interface';

@Injectable()
export class CompleteDeliveryImageRepository
  extends MongoRepository
  implements ICompleteDeliveryImageRepository
{
  constructor(
    @InjectModel(CompleteDeliveryImage.name)
    private readonly model: Model<CompleteDeliveryImage>,
  ) {
    super();
  }

  async create({ orderId, image }: { orderId: number; image: Buffer }) {
    try {
      const imageModel = new this.model({ _id: orderId, image });

      await imageModel.save();
    } catch (error) {
      if (this.isDuplicatedDataError(error)) {
        throw new DuplicatedDataException(orderId);
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findCompleteImageBufferByOrderId(orderId: number) {
    try {
      const completeDeliveryImage = await this.model
        .findById(orderId)
        .select(['image', '-_id']);

      this.validateNull(orderId, completeDeliveryImage);

      return plainToInstance(
        FindCompleteDeliveryImageDto,
        completeDeliveryImage,
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
