import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { createLastMonthRange } from '@src/core/module';
import { AverageCostEntity, ILocationRepository } from '@src/database';
import { IAverageCostRepository } from '@src/database/type-orm/repository/average-cost/average-cost.repository.interface';
import { IDeliveryPersonMatchedDateRepository } from '@src/database/type-orm/repository/delivery-person-matched-date/delivery-person-matched-date.repository.interface';
import { IRepository } from './repository.service.interface';

@Injectable()
export class RepositoryService implements IRepository {
  constructor(
    @Inject(RepositoryToken.AVERAGE_COST_REPOSITORY)
    private readonly averageCostRepository: IAverageCostRepository,
    @Inject(RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY)
    private readonly deliveryPersonMatchedDateRepository: IDeliveryPersonMatchedDateRepository,
    @Inject(RepositoryToken.LOCATION_REPOSITORY)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async findAllLastMonthOrderIdByCurrentMonth(currentDate: Date) {
    const { start, end } = createLastMonthRange(currentDate);

    const orders =
      await this.deliveryPersonMatchedDateRepository.findAllOrderIdByBetweenDates(
        start,
        end,
      );

    return orders.map((order) => order.id);
  }

  async findAllDepartureDestinationByOrderIds(orderIds: number[]) {
    return await this.locationRepository.findAllDestinationDepartureByOrderIds(
      orderIds,
    );
  }

  async saveAverageCost(averageCostEntity: AverageCostEntity) {
    const date = new Date();

    await this.averageCostRepository.createAverageCost(averageCostEntity, date);
  }
}
