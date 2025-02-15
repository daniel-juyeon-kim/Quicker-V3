import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseException } from '@src/core/module';
import { OrderEntity } from '@src/database/type-orm/entity';
import { NotExistDataException } from '@src/database/type-orm/util';
import { In, Repository } from 'typeorm';
import { ILocationRepository } from '.';
import { AbstractRepository } from '../abstract-repository';

@Injectable()
export class LocationRepository
  extends AbstractRepository
  implements ILocationRepository
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {
    super();
  }

  async findDestinationDepartureByOrderId(orderId: number) {
    try {
      const destinationDeparture = await this.repository.findOne({
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

  async findAllDestinationDepartureByOrderId(orderIds: number[]) {
    const orderLocations = await this.repository.find({
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
