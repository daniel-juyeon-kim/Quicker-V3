import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { NotExistDataException } from '@src/database';
import { mock, mockClear } from 'jest-mock-extended';
import { OrderDeliveryPersonController } from './order-delivery-person.controller';
import { IOrderDeliveryPersonService } from './order-delivery-person.service.interface';

describe('OrderDeliveryPersonController', () => {
  let controller: OrderDeliveryPersonController;
  const service = mock<IOrderDeliveryPersonService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderDeliveryPersonController],
      providers: [
        {
          provide: ServiceToken.ORDER_DELIVERY_PERSON_SERVICE,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<OrderDeliveryPersonController>(
      OrderDeliveryPersonController,
    );
    mockClear(service);
  });

  describe('findDeliveryPersonCurrentLocation()', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolveValue = { x: 126.73, y: 37.71 };
      service.findCurrentLocation.mockResolvedValueOnce(resolveValue);

      await expect(
        controller.findDeliveryPersonCurrentLocation(orderId),
      ).resolves.toEqual(resolveValue);

      expect(service.findCurrentLocation).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataException('데이터가 존재하지 않습니다.');
      service.findCurrentLocation.mockRejectedValueOnce(error);

      await expect(
        controller.findDeliveryPersonCurrentLocation(orderId),
      ).rejects.toStrictEqual(error);

      expect(service.findCurrentLocation).toHaveBeenCalledWith(orderId);
    });
  });

  describe('getDeliveryPersonCurrentLocation()', () => {
    test('통과하는 테스트', async () => {
      const dto = {
        x: 126.73,
        y: 37.71,
        orderId: 1,
      };

      await controller.createDeliveryPersonCurrentLocation(dto);

      expect(service.createDeliveryPersonCurrentLocation).toHaveBeenCalledWith(
        dto,
      );
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const dto = {
        x: 126.73,
        y: 37.71,
        orderId: 1,
      };
      const error = new NotExistDataException('데이터가 존재하지 않습니다.');
      service.createDeliveryPersonCurrentLocation.mockRejectedValueOnce(error);

      await expect(
        controller.createDeliveryPersonCurrentLocation(dto),
      ).rejects.toStrictEqual(error);

      expect(service.createDeliveryPersonCurrentLocation).toHaveBeenCalledWith(
        dto,
      );
    });
  });

  describe('updateDeliveryPersonLocation()', () => {
    const walletAddress = '지갑주소';
    const orderId = 1;

    test('통과하는 테스트', async () => {
      await controller.updateDeliveryPersonLocation(orderId, { walletAddress });

      expect(service.matchDeliveryPersonAtOrder).toHaveBeenCalledWith({
        orderId,
        walletAddress,
      });
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const error = new NotExistDataException('존제하지 않는 데이터');
      service.matchDeliveryPersonAtOrder.mockRejectedValueOnce(error);

      await expect(
        controller.updateDeliveryPersonLocation(orderId, { walletAddress }),
      ).rejects.toStrictEqual(error);

      expect(service.matchDeliveryPersonAtOrder).toHaveBeenCalledWith({
        orderId,
        walletAddress,
      });
    });
  });
});
