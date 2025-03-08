import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { OrderDeliveryPersonLocationDto } from '@src/router/order-delivery-person/dto/order-delivery-person-location.dto';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
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
      throw new UnknownDataBaseException(error);
    }
  }

  async findCurrentLocationByOrderId(orderId: number) {
    try {
      const deliveryPerson = await this.model
        .findOne({ _id: orderId })
        .select(['-_id', '__v', 'location.x', 'location.y'])
        .lean();

      this.validateNull(orderId, deliveryPerson);

      return plainToInstance(
        OrderDeliveryPersonLocationDto,
        deliveryPerson.location,
      );
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
