import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { UnknownDataBaseError } from '@src/core/module';
import { mock, mockClear } from 'jest-mock-extended';
import { OrderAverageController } from './order-average.controller';
import { IOrderAverageService } from './order-average.service.interface';

describe('OrderAverageController', () => {
  let controller: OrderAverageController;
  const service = mock<IOrderAverageService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderAverageController],
      providers: [
        {
          provide: ServiceToken.ORDER_AVERAGE_SERVICE,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<OrderAverageController>(OrderAverageController);
    mockClear(service);
  });

  describe('getLatestAverageCost()', () => {
    test('통과하는 테스트', async () => {
      const distance = 50;
      const resolveValue = { averageCost: 123000 };
      service.findLatestOrderAverageCost.mockResolvedValueOnce(resolveValue);

      await expect(controller.getLatestAverageCost(distance)).resolves.toEqual(
        resolveValue,
      );
      expect(service.findLatestOrderAverageCost).toHaveBeenCalledWith(distance);
    });

    describe('실패하는 테스트', () => {
      test('예상하지 못한 에러 발생', async () => {
        const distance = 50;
        const error = new UnknownDataBaseError('알 수 없는 에러');
        service.findLatestOrderAverageCost.mockRejectedValueOnce(error);

        await expect(
          controller.getLatestAverageCost(distance),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});
