import { Injectable } from '@nestjs/common';
import {
  DuplicatedDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { Between } from 'typeorm';
import { DeliveryPersonMatchedDateEntity } from '../../entity';
import { Transactional } from '../../util/transaction/decorator/transactional.decorator';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AbstractRepository } from '../abstract-repository';
import { IDeliveryPersonMatchedDateRepository } from './delivery-person-matched-date.repository.interface';

@Injectable()
export class DeliveryPersonMatchedDateRepository
  extends AbstractRepository<DeliveryPersonMatchedDateEntity>
  implements IDeliveryPersonMatchedDateRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(DeliveryPersonMatchedDateEntity);
  }

  @Transactional()
  async create(orderId: number) {
    try {
      const matchedDateExists = await this.getRepository().existsBy({
        id: orderId,
      });

      if (matchedDateExists) {
        throw new DuplicatedDataException(orderId);
      }

      const matchedDate = new DeliveryPersonMatchedDateEntity();
      matchedDate.id = orderId;

      await this.getRepository().insert(matchedDate);
    } catch (error) {
      if (error instanceof DuplicatedDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findAllOrderIdByBetweenDates(startDate: Date, endDate: Date) {
    try {
      return await this.getRepository().find({
        select: { id: true },
        where: { date: Between(startDate, endDate) },
      });
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }
}
