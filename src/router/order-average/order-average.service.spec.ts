import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import { createLastMonth, UnknownDataBaseError } from '@src/core/module';
import { NotExistDataError } from '@src/database';
import { IAverageCostRepository } from '@src/database/type-orm/repository/average-cost/average-cost.repository.interface';
import { mock, mockClear } from 'jest-mock-extended';
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

  describe('findLatestOrderAverageCost()', () => {
    test('통과하는 테스트', async () => {
      const distance = 50;
      const resolvedValue = 100;
      const lastMonth = createLastMonth(new Date());
      repository.findAverageCostByDateAndDistanceUnit.mockResolvedValue(
        resolvedValue,
      );

      await expect(
        service.findLatestOrderAverageCost(distance),
      ).resolves.toEqual({ averageCost: resolvedValue });
      expect(
        repository.findAverageCostByDateAndDistanceUnit,
      ).toHaveBeenCalledWith({
        distanceUnit: '50KM',
        lastMonth,
      });
    });

    describe('실패하는 테스트', () => {
      test('NotExistDataError를 던짐', async () => {
        const distance = 50;
        const error = new NotExistDataError('데이터가 존재하지 않습니다.');
        repository.findAverageCostByDateAndDistanceUnit.mockRejectedValueOnce(
          error,
        );

        await expect(
          service.findLatestOrderAverageCost(distance),
        ).rejects.toStrictEqual(error);
      });

      test('UnknownDataBaseError를 던짐', async () => {
        const distance = 50;
        const error = new UnknownDataBaseError(new Error('알수없는 에러'));
        repository.findAverageCostByDateAndDistanceUnit.mockRejectedValueOnce(
          error,
        );

        await expect(
          service.findLatestOrderAverageCost(distance),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});
