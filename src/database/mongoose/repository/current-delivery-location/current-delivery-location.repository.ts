import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UnknownDataBaseError } from '@src/core/module';
import { Model } from 'mongoose';
import { NotExistDataError } from '../../../type-orm';
import {
  CurrentDeliveryLocation,
  Location,
} from '../../models/current-deliver-location';
import { Transactional } from '../../util/transactional.decorator';
import { MongoRepository } from '../abstract.repository';
import { ICurrentDeliveryLocationRepository } from './current-delivery-location.repository.interface';

@Injectable()
export class CurrentDeliveryLocationRepository
  extends MongoRepository
  implements ICurrentDeliveryLocationRepository
{
  constructor(
    @InjectModel(CurrentDeliveryLocation.name)
    private readonly model: Model<CurrentDeliveryLocation>,
  ) {
    super();
  }

  @Transactional()
  async saveDeliveryPersonLocation(orderId: number, location: Location) {
    try {
      if (await this.model.exists({ _id: orderId })) {
        await this.model.findByIdAndUpdate(orderId, { location });
        return;
      }

      await this.model.create({ _id: orderId, location });
    } catch (error) {
      throw new UnknownDataBaseError(error);
    }
  }

  async findCurrentLocationByOrderId(orderId: number) {
    try {
      const document = await this.model
        .findOne({ _id: orderId })
        .select(['-_id', 'location.x', 'location.y'])
        .lean();

      this.validateNull(document);

      return document.location;
    } catch (error) {
      if (error instanceof NotExistDataError) {
        throw new NotExistDataError(
          `${orderId}에 대한 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }
}
