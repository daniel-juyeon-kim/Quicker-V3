import { Injectable } from '@nestjs/common';
import {
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { OrderEntity } from '@src/database/type-orm/entity';
import { OrderLocationDto } from '@src/router/order-location/dto/order-location.dto';
import { plainToInstance } from 'class-transformer';
import { In } from 'typeorm';
import { ILocationRepository } from '.';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AbstractRepository } from '../abstract-repository';

@Injectable()
export class LocationRepository
  extends AbstractRepository<OrderEntity>
  implements ILocationRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(OrderEntity);
  }

  async findDestinationDepartureByOrderId(orderId: number) {
    try {
      const destinationDeparture = await this.getRepository().findOne({
        where: { id: orderId },
        relations: { departure: true, destination: true },
        select: {
          id: true,
          departure: { x: true, y: true },
          destination: { x: true, y: true },
        },
      });

      this.validateNotNull(orderId, destinationDeparture);

      return plainToInstance(OrderLocationDto, destinationDeparture);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findAllDestinationDepartureByOrderIds(orderIds: number[]) {
    try {
      const orderLocations = await this.getRepository().find({
        where: { id: In(orderIds) },
        relations: { departure: true, destination: true },
        select: {
          id: true,
          departure: { x: true, y: true },
          destination: { x: true, y: true },
        },
      });

      this.validateNotNull(orderIds, orderLocations);

      return plainToInstance(OrderLocationDto, orderLocations);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
