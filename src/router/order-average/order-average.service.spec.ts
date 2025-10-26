import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import {
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { createLastMonth } from '@src/core/module';
import { IAverageCostRepository } from '@src/database/type-orm/repository/average-cost/average-cost.repository.interface';
import { plainToInstance } from 'class-transformer';
import { mock, mockClear } from 'jest-mock-extended';
import { OrderAverageCostDto } from './dto/order-average-cost.dto';
import { OrderAverageService } from './order-average.service';

describe('OrderAverageService', () => {
  let service: OrderAverageService;
  const repository = mock<IAverageCostRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderAverageService,
        {
          provide: RepositoryToken.AVERAGE_COST_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<OrderAverageService>(OrderAverageService);
    mockClear(repository);
  });

  describe('findLatestOrderAverageCostByDistance', () => {
    test('통과하는 테스트', async () => {
      const distance = 50;
      const resolvedValue = plainToInstance(OrderAverageCostDto, {
        averageCost: 100,
      });
      const lastMonth = createLastMonth(new Date());

      repository.findByDateAndDistanceUnit.mockResolvedValue(resolvedValue);

      await expect(
        service.findLatestOrderAverageCostByDistance(distance),
      ).resolves.toEqual(resolvedValue);
      expect(repository.findByDateAndDistanceUnit).toHaveBeenCalledWith({
        distanceUnit: '50KM',
        lastMonth,
      });
    });

    describe('실패하는 테스트', () => {
      test('NotExistDataError를 던짐', async () => {
        const distance = 50;
        const error = new NotExistDataException(distance);
        repository.findByDateAndDistanceUnit.mockRejectedValueOnce(error);

        await expect(
          service.findLatestOrderAverageCostByDistance(distance),
        ).rejects.toStrictEqual(error);
      });

      test('UnknownDataBaseError를 던짐', async () => {
        const distance = 50;
        const error = new UnknownDataBaseException(new Error('알수없는 에러'));
        repository.findByDateAndDistanceUnit.mockRejectedValueOnce(error);

        await expect(
          service.findLatestOrderAverageCostByDistance(distance),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});
