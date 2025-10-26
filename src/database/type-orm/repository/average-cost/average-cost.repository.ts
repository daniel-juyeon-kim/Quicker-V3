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

  async findByDateAndDistanceUnit({
    distanceUnit,
    lastMonth,
  }: {
    distanceUnit: AverageCostDistanceUnion;
    lastMonth: Date;
  }) {
    try {
      const average = await this.getRepository().findOne({
        select: { [distanceUnit]: true },
        where: { date: lastMonth },
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
  async create(averageCost: Omit<AverageCostEntity, 'date'>, date: Date) {
    try {
      const isExist = await this.getManager().existsBy(AverageCostEntity, {
        date,
      });

      if (isExist) {
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
