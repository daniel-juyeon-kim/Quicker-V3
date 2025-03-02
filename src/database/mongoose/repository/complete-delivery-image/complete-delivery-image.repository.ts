import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UnknownDataBaseException } from '@src/core/module';
import { OrderCompleteImageDto } from '@src/router/order-image/dto/order-complete-image.dto';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '../../../type-orm';
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

  async create({
    orderId,
    bufferImage,
  }: {
    orderId: number;
    bufferImage: Buffer;
  }) {
    try {
      const image = new this.model({ _id: orderId, bufferImage });

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

  async findCompleteImageBufferByOrderId(orderId: number) {
    try {
      const image = await this.model
        .findById(orderId)
        .select(['bufferImage', '-_id']);

      this.validateNull(image);

      const { bufferImage } = image.toJSON();

      return plainToInstance(OrderCompleteImageDto, bufferImage, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException(
          `${orderId}에 해당되는 이미지 버퍼가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
