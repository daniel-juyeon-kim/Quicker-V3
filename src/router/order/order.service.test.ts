import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken, ServiceToken } from '@src/core/constant';
import { UnknownDataBaseException } from '@src/core/module';
import { IOrderRepository, NotExistDataException } from '@src/database';
import { mock, mockClear } from 'jest-mock-extended';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { IOrderService } from './order.service.interface';

describe('OrderService', () => {
  let service: IOrderService;
  const repository = mock<IOrderRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ServiceToken.ORDER_SERVICE, useClass: OrderService },
        {
          provide: RepositoryToken.ORDER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(ServiceToken.ORDER_SERVICE);

    mockClear(repository);
  });

  describe('createOrder', () => {
    test('통과하는 테스트', async () => {
      const dto: CreateOrderDto = {
        walletAddress: '0x123456789abcdef',
        detail: 'Fragile, handle with care',
        transportation: {
          truck: 1,
        },
        product: {
          width: 20,
          length: 30,
          height: 40,
          weight: 10,
        },
        destination: {
          x: 37.7749,
          y: -122.4194,
        },
        departure: {
          x: 34.0522,
          y: -118.2437,
        },
        sender: {
          name: 'John Doe',
          phone: '123-456-7890',
        },
        receiver: {
          name: 'Jane Smith',
          phone: '987-654-3210',
        },
      };
      const calledValue = {
        ...dto,
        transportation: {
          truck: 1,
        },
      };

      await expect(service.createOrder(dto)).resolves.toEqual(undefined);

      expect(repository.createOrder).toHaveBeenCalledWith(calledValue);
    });

    test('실패하는 테스트, 지갑주소에 해당되는 사용자가 없으면 NotExistDataError를 던짐', async () => {
      const walletAddress = '0x123456789abcdef';
      const dto: CreateOrderDto = {
        walletAddress,
        detail: 'Test order',
        transportation: { truck: 1 },
        product: { width: 10, length: 20, height: 30, weight: 5 },
        destination: { x: 37.7749, y: -122.4194 },
        departure: { x: 34.0522, y: -118.2437 },
        sender: { name: 'John Doe', phone: '123-456-7890' },
        receiver: { name: 'Jane Smith', phone: '987-654-3210' },
      };
      const error = new NotExistDataException(
        `${walletAddress}에 해당되는 사용자를 찾지 못했습니다.`,
      );
      repository.createOrder.mockRejectedValue(error);

      await expect(service.createOrder(dto)).rejects.toStrictEqual(error);
    });
  });

  describe('findAllOrderDetailByOrderIds', () => {
    test('통과하는 테스트', async () => {
      const returnValue = [
        {
          id: 1,
          detail: 'Fragile item, handle with care',
          product: {
            width: 10,
            length: 20,
            height: 15,
            weight: 5,
          },
          departure: {
            x: 37.5665,
            y: 126.978,
            detail: 'Seoul, South Korea',
            sender: {
              name: 'Kim Minjun',
              phone: '010-1234-5678',
            },
          },
          destination: {
            x: 35.1796,
            y: 129.0756,
            detail: 'Busan, South Korea',
            receiver: {
              name: 'Lee Jihye',
              phone: '010-9876-5432',
            },
          },
        },
      ];
      repository.findAllCreatedOrDeliveredOrderDetailByOrderIds.mockResolvedValue(
        returnValue,
      );
      const orderIds = [1, 2, 3, 4];

      await expect(
        service.findAllOrderDetailByOrderIds(orderIds),
      ).resolves.toEqual(returnValue);

      expect(
        repository.findAllCreatedOrDeliveredOrderDetailByOrderIds,
      ).toHaveBeenCalledWith(orderIds);
    });

    test('실패하는 테스트, 데이터베이스에 알 수 없는 에러가 발생하면 UnknownDataBaseError를 던짐', async () => {
      const orderIds = [1, 2, 3];
      const error = new UnknownDataBaseException(`알 수 없는 에러.`);
      repository.findAllCreatedOrDeliveredOrderDetailByOrderIds.mockRejectedValue(
        error,
      );

      await expect(
        service.findAllOrderDetailByOrderIds(orderIds),
      ).rejects.toStrictEqual(error);
    });
  });
});
