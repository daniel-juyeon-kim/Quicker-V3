import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { createLastMonth } from '@src/core/module';
import { findDistanceKey } from '@src/core/util/distance';
import { IAverageCostRepository } from '@src/database/type-orm/repository/average-cost/average-cost.repository.interface';
import { IOrderAverageService } from './order-average.service.interface';

@Injectable()
export class OrderAverageService implements IOrderAverageService {
  constructor(
    @Inject(RepositoryToken.AVERAGE_COST_REPOSITORY)
    private readonly repository: IAverageCostRepository,
  ) {}

  async findLatestOrderAverageCostByDistance(distance: number) {
    const distanceUnit = findDistanceKey(distance);
    const currentDate = new Date();
    const lastMonth = createLastMonth(currentDate);

    return await this.repository.findAverageCostByDateAndDistanceUnit({
      distanceUnit,
      lastMonth,
    });
  }
}
