import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import { createLastMonthRange } from '@src/core/module';
import { ILocationRepository } from '@src/database';
import { IAverageCostRepository } from '@src/database/type-orm/repository/average-cost/average-cost.repository.interface';
import { IDeliveryPersonMatchedDateRepository } from '@src/database/type-orm/repository/delivery-person-matched-date/delivery-person-matched-date.repository.interface';
import { mock } from 'jest-mock-extended';
import { RepositoryService } from './repository.service';

describe('RepositoryService', () => {
  let service: RepositoryService;
  const averageCostRepository = mock<IAverageCostRepository>();
  const deliveryPersonMatchedDateRepository =
    mock<IDeliveryPersonMatchedDateRepository>();
  const locationRepository = mock<ILocationRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryService,
        {
          provide: RepositoryToken.AVERAGE_COST_REPOSITORY,
          useValue: averageCostRepository,
        },
        {
          provide: RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY,
          useValue: deliveryPersonMatchedDateRepository,
        },
        {
          provide: RepositoryToken.LOCATION_REPOSITORY,
          useValue: locationRepository,
        },
      ],
    }).compile();

    service = module.get<RepositoryService>(RepositoryService);
  });

  describe('findAllLastMonthOrderIdByCurrentMonth', () => {
    it('레포지토레에서 아이디가 있는 객체 배열을 반환하면 Array.map을 통해 id 값 배열을 반환한다.', async () => {
      const currentDate = new Date();
      const { start, end } = createLastMonthRange(currentDate);
      const mockOrders = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = [1, 2, 3];

      deliveryPersonMatchedDateRepository.findAllOrderIdByBetweenDates.mockResolvedValue(
        mockOrders,
      );

      await expect(
        service.findAllLastMonthOrderIdByCurrentMonth(currentDate),
      ).resolves.toEqual(result);
      expect(
        deliveryPersonMatchedDateRepository.findAllOrderIdByBetweenDates,
      ).toHaveBeenCalledWith(start, end);
    });

    it('레포지토레에서 빈 배열을 반환하면 Array.map을 통해 빈 배열을 반환한다.', async () => {
      const currentDate = new Date();
      const { start, end } = createLastMonthRange(currentDate);
      const mockOrders = [];
      const result = [];

      deliveryPersonMatchedDateRepository.findAllOrderIdByBetweenDates.mockResolvedValue(
        mockOrders,
      );

      await expect(
        service.findAllLastMonthOrderIdByCurrentMonth(currentDate),
      ).resolves.toEqual(result);
      expect(
        deliveryPersonMatchedDateRepository.findAllOrderIdByBetweenDates,
      ).toHaveBeenCalledWith(start, end);
    });
  });
});
