import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseException } from '@src/core/module';
import { Repository } from 'typeorm';
import { AverageCostEntity } from '../../entity/average-cost.entity';
import { DuplicatedDataException, NotExistDataException } from '../../util';
import { Transactional } from '../../util/transactional.decorator';
import { AbstractRepository } from '../abstract-repository';
import {
  AverageCostDistanceUnion,
  IAverageCostRepository,
} from './average-cost.repository.interface';

@Injectable()
export class AverageCostRepository
  extends AbstractRepository
  implements IAverageCostRepository
{
  constructor(
    @InjectRepository(AverageCostEntity)
    private readonly repository: Repository<AverageCostEntity>,
  ) {
    super();
  }

  async findAverageCostByDateAndDistanceUnit({
    distanceUnit,
    lastMonth,
  }: {
    distanceUnit: AverageCostDistanceUnion;
    lastMonth: Date;
  }) {
    try {
      const average = await this.repository.findOne({
        where: { date: lastMonth },
        select: { [distanceUnit]: true },
      });

      this.validateNotNull(lastMonth, average);

      return average[distanceUnit];
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
      if (await this.manager.existsBy(AverageCostEntity, { date })) {
        throw new DuplicatedDataException(
          `${date}에 해당되는 데이터가 이미 존재합니다.`,
        );
      }

      await this.manager.insert(AverageCostEntity, { date, ...averageCost });
    } catch (error) {
      if (error instanceof DuplicatedDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}
