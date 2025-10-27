import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { NotExistDataException } from '@src/core/exception';
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

  describe('findDeliveryPersonCurrentLocation', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolveValue = { x: 126.73, y: 37.71 };
      service.findCurrentLocationByOrderId.mockResolvedValueOnce(resolveValue);

      await expect(
        controller.findDeliveryPersonCurrentLocation(orderId),
      ).resolves.toEqual(resolveValue);

      expect(service.findCurrentLocationByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataException(orderId);
      service.findCurrentLocationByOrderId.mockRejectedValueOnce(error);

      await expect(
        controller.findDeliveryPersonCurrentLocation(orderId),
      ).rejects.toStrictEqual(error);

      expect(service.findCurrentLocationByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });
  });

  describe('createDeliveryPersonCurrentLocation', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const dto = {
        x: 126.73,
        y: 37.71,
      };

      await controller.createDeliveryPersonCurrentLocation(orderId, dto);

      expect(service.createCurrentLocation).toHaveBeenCalledWith({
        ...dto,
        orderId,
      });
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const orderId = 1;
      const dto = {
        x: 126.73,
        y: 37.71,
      };
      const error = new NotExistDataException(4);
      service.createCurrentLocation.mockRejectedValueOnce(error);

      await expect(
        controller.createDeliveryPersonCurrentLocation(orderId, dto),
      ).rejects.toStrictEqual(error);

      expect(service.createCurrentLocation).toHaveBeenCalledWith({
        ...dto,
        orderId,
      });
    });
  });

  describe('updateDeliveryPersonLocation', () => {
    const walletAddress = '지갑주소';
    const orderId = 1;

    test('통과하는 테스트', async () => {
      await controller.updateDeliveryPersonLocation(orderId, { walletAddress });

      expect(service.matchDeliveryPerson).toHaveBeenCalledWith({
        orderId,
        walletAddress,
      });
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const error = new NotExistDataException(99);
      service.matchDeliveryPerson.mockRejectedValueOnce(error);

      await expect(
        controller.updateDeliveryPersonLocation(orderId, { walletAddress }),
      ).rejects.toStrictEqual(error);

      expect(service.matchDeliveryPerson).toHaveBeenCalledWith({
        orderId,
        walletAddress,
      });
    });
  });
});
