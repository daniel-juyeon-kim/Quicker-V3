import { Between, EntityManager, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseError } from '@src/core/module';
import { DeliveryPersonMatchedDateEntity } from '../../entity';
import { DuplicatedDataError } from '../../util';
import { AbstractRepository } from '../abstract-repository';
import { IDeliveryPersonMatchedDateRepository } from './delivery-person-matched-date.repository.interface';

@Injectable()
export class DeliveryPersonMatchedDateRepository
  extends AbstractRepository
  implements IDeliveryPersonMatchedDateRepository
{
  constructor(
    @InjectRepository(DeliveryPersonMatchedDateEntity)
    private readonly repository: Repository<DeliveryPersonMatchedDateEntity>,
  ) {
    super();
  }

  async create(manager: EntityManager, orderId: number) {
    try {
      const matchedDateExists = await manager.existsBy(
        DeliveryPersonMatchedDateEntity,
        { id: orderId },
      );

      if (matchedDateExists) {
        throw new DuplicatedDataError(
          `${orderId}에 대해 중복된 데이터가 존재합니다.`,
        );
      }

      const matchedDate = new DeliveryPersonMatchedDateEntity();
      matchedDate.id = orderId;

      await manager.insert(DeliveryPersonMatchedDateEntity, matchedDate);
    } catch (error) {
      if (error instanceof DuplicatedDataError) {
        throw error;
      }
      throw new UnknownDataBaseError(error);
    }
  }

  async findAllOrderIdByBetweenDates(startDate: Date, endDate: Date) {
    try {
      return await this.repository.find({
        select: { id: true },
        where: { date: Between(startDate, endDate) },
      });
    } catch (error) {
      throw new UnknownDataBaseError(error);
    }
  }
}
