import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnknownDataBaseError } from '../../../../core';
import { AverageCost } from '../../entity/average-cost.entity';
import { DuplicatedDataError, NotExistDataError } from '../../util';
import { Transactional } from '../../util/transactional.decorator';
import { AbstractRepository } from '../abstract-repository';

@Injectable()
export class AverageCostRepository extends AbstractRepository {
  @InjectRepository(AverageCost)
  private readonly repository: Repository<AverageCost>;

  constructor() {
    super();
  }

  async findAverageCostByDateAndDistanceUnit({
    distanceUnit,
    lastMonth,
  }: {
    distanceUnit: DistanceUnit;
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
      if (error instanceof NotExistDataError) {
        throw error;
      }
      throw new UnknownDataBaseError(error);
    }
  }

  @Transactional()
  async createAverage(averageCost: Omit<AverageCost, 'date'>, date: Date) {
    try {
      if (await this.manager.existsBy(AverageCost, { date })) {
        throw new DuplicatedDataError(
          `${date}에 해당되는 데이터가 이미 존재합니다.`,
        );
      }

      await this.manager.insert(AverageCost, { date, ...averageCost });
    } catch (error) {
      if (error instanceof DuplicatedDataError) {
        throw error;
      }
      throw new UnknownDataBaseError(error);
    }
  }
}

type AverageOfCostKeys = keyof AverageCost;

export type DistanceUnit = Exclude<AverageOfCostKeys, 'date'>;
