import { Injectable } from '@nestjs/common';
import {
  DuplicatedDataException,
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { OrderAverageCostDto } from '@src/router/order-average/dto/order-average-cost.dto';
import { plainToInstance } from 'class-transformer';
import { AverageCostEntity } from '../../entity/average-cost.entity';
import { Transactional } from '../../util/transaction/decorator/transactional.decorator';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AbstractRepository } from '../abstract-repository';
import {
  AverageCostDistanceUnion,
  IAverageCostRepository,
} from './average-cost.repository.interface';

@Injectable()
export class AverageCostRepository
  extends AbstractRepository<AverageCostEntity>
  implements IAverageCostRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(AverageCostEntity);
  }

  async findAverageCostByDateAndDistanceUnit({
    distanceUnit,
    lastMonth,
  }: {
    distanceUnit: AverageCostDistanceUnion;
    lastMonth: Date;
  }) {
    try {
      const average = await this.getRepository().findOne({
        where: { date: lastMonth },
        select: { [distanceUnit]: true },
      });

      this.validateNotNull(lastMonth, average);

      return plainToInstance(OrderAverageCostDto, average[distanceUnit]);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  @Transactional()
  async createAverageCost(
    averageCost: Omit<AverageCostEntity, 'date'>,
    date: Date,
  ) {
    try {
      if (await this.getManager().existsBy(AverageCostEntity, { date })) {
        throw new DuplicatedDataException(date);
      }

      await this.getManager().insert(AverageCostEntity, {
        date,
        ...averageCost,
      });
    } catch (error) {
      if (error instanceof DuplicatedDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
