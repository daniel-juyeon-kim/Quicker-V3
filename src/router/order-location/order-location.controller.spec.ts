import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { NotExistDataException } from '@src/database';
import { mock, mockClear } from 'jest-mock-extended';
import { OrderLocationController } from './order-location.controller';
import { OrderLocationService } from './order-location.service';

describe('OrderLocationController', () => {
  let controller: OrderLocationController;
  const service = mock<OrderLocationService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderLocationController],
      providers: [
        { provide: ServiceToken.ORDER_LOCATION_SERVICE, useValue: service },
      ],
    }).compile();

    controller = module.get<OrderLocationController>(OrderLocationController);
    mockClear(service);
  });

  describe('getCoordinates()', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue = {
        id: orderId,
        departure: { x: 126.977, y: 37.5665 },
        destination: { x: 129.0756, y: 35.1796 },
      };

      service.findDepartureAndDestinationByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(controller.getCoordinates(orderId)).resolves.toStrictEqual(
        resolvedValue,
      );

      expect(service.findDepartureAndDestinationByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });

    test('실패하는 테스트, 데이터가 존재하지 않아 예외 발생', async () => {
      const orderId = 1;
      const error = new NotExistDataException('존재하지 않는 데이터');
      service.findDepartureAndDestinationByOrderId.mockRejectedValueOnce(error);

      await expect(controller.getCoordinates(orderId)).rejects.toStrictEqual(
        error,
      );
    });
  });
});
