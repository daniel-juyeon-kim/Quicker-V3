import { Injectable } from '@nestjs/common';
import { UnknownDataBaseException } from '@src/core/module';
import { OrderEntity } from '@src/database/type-orm/entity';
import { NotExistDataException } from '@src/database/type-orm/util';
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

      return destinationDeparture;
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findAllDestinationDepartureByOrderIds(orderIds: number[]) {
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

    return orderLocations;
  }
}
