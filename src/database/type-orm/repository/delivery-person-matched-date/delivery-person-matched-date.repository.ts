import { Between, Repository } from 'typeorm';

import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseException } from '@src/core/module';
import { DeliveryPersonMatchedDateEntity } from '../../entity';
import { DuplicatedDataException } from '../../util';
import { AbstractRepository } from '../abstract-repository';
import { IDeliveryPersonMatchedDateRepository } from './delivery-person-matched-date.repository.interface';

@Injectable()
export class DeliveryPersonMatchedDateRepository
  extends AbstractRepository
  implements IDeliveryPersonMatchedDateRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    @InjectRepository(DeliveryPersonMatchedDateEntity)
    private readonly repository: Repository<DeliveryPersonMatchedDateEntity>,
  ) {
    super();
  }

  async create(orderId: number) {
    try {
      const matchedDateExists = await this.txHost.tx
        .getRepository(DeliveryPersonMatchedDateEntity)
        .existsBy({ id: orderId });

      if (matchedDateExists) {
        throw new DuplicatedDataException(
          `${orderId}에 대해 중복된 데이터가 존재합니다.`,
        );
      }

      const matchedDate = new DeliveryPersonMatchedDateEntity();
      matchedDate.id = orderId;

      await this.txHost.tx
        .getRepository(DeliveryPersonMatchedDateEntity)
        .insert(matchedDate);
    } catch (error) {
      if (error instanceof DuplicatedDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findAllOrderIdByBetweenDates(startDate: Date, endDate: Date) {
    try {
      return await this.repository.find({
        select: { id: true },
        where: { date: Between(startDate, endDate) },
      });
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }
}
