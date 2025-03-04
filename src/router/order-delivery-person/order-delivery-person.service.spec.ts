import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@slack/web-api/dist/types/response/AdminAppsRequestsListResponse';
import { ENTITY_MANAGER_KEY, RepositoryToken } from '@src/core/constant';
import { NotExistDataException, SmsApiException } from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { DeliveryUrlCreator, NaverSmsApi } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import {
  CurrentDeliveryLocationRepository,
  DeliveryPersonMatchedDateEntity,
  DeliveryPersonMatchedDateRepository,
  DepartureEntity,
  DestinationEntity,
  IOrderRepository,
  OrderEntity,
  OrderRepository,
  ProductEntity,
  ReceiverEntity,
  ReceiverRepository,
  TransportationEntity,
  UserEntity,
} from '@src/database';
import { ICurrentDeliveryLocationRepository } from '@src/database/mongoose/repository/current-delivery-location/current-delivery-location.repository.interface';
import { IDeliveryPersonMatchedDateRepository } from '@src/database/type-orm/repository/delivery-person-matched-date/delivery-person-matched-date.repository.interface';
import { IReceiverRepository } from '@src/database/type-orm/repository/receiver/receiver.repository.interface';
import { TransactionManager } from '@src/database/type-orm/util/transaction/transaction-manager/transaction-manager';
import { mock, mockClear } from 'jest-mock-extended';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../test/config/typeorm.module';
import { OrderDeliveryPersonService } from './order-delivery-person.service';

describe('OrderDeliveryPersonService', () => {
  let service: OrderDeliveryPersonService;

  const orderRepository = mock<IOrderRepository>();
  const receiverRepository = mock<IReceiverRepository>();
  const currentDeliveryLocationRepository =
    mock<ICurrentDeliveryLocationRepository>();
  const deliveryPersonMatchedDateRepository =
    mock<IDeliveryPersonMatchedDateRepository>();
  const deliveryUrlCreator = mock<DeliveryUrlCreator>();
  const smsApi = mock<NaverSmsApi>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDeliveryPersonService,
        {
          provide: RepositoryToken.ORDER_REPOSITORY,
          useValue: orderRepository,
        },
        {
          provide: RepositoryToken.RECEIVER_REPOSITORY,
          useValue: receiverRepository,
        },
        {
          provide: RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY,
          useValue: deliveryPersonMatchedDateRepository,
        },
        {
          provide: RepositoryToken.CURRENT_DELIVERY_LOCATION_REPOSITORY,
          useValue: currentDeliveryLocationRepository,
        },
        { provide: DeliveryUrlCreator, useValue: deliveryUrlCreator },
        { provide: NaverSmsApi, useValue: smsApi },
      ],
    }).compile();

    service = module.get<OrderDeliveryPersonService>(
      OrderDeliveryPersonService,
    );

    mockClear(orderRepository);
    mockClear(receiverRepository);
    mockClear(deliveryPersonMatchedDateRepository);
    mockClear(currentDeliveryLocationRepository);
    mockClear(deliveryUrlCreator);
    mockClear(smsApi);
  });

  describe('findCurrentLocationByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;

      await service.findCurrentLocationByOrderId(orderId);

      expect(
        currentDeliveryLocationRepository.findCurrentLocationByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, NotExistDataError를 던짐 ', async () => {
      const orderId = 1;
      const error = new NotExistDataException('orderId', orderId);
      currentDeliveryLocationRepository.findCurrentLocationByOrderId.mockRejectedValueOnce(
        error,
      );

      await expect(
        service.findCurrentLocationByOrderId(orderId),
      ).rejects.toStrictEqual(error);
      expect(
        currentDeliveryLocationRepository.findCurrentLocationByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });
  });

  describe('createCurrentLocation', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const location = { x: 128.25424, y: 35.95234 };
      const dto = {
        orderId,
        ...location,
      };

      await expect(service.createCurrentLocation(dto)).resolves.toEqual(
        undefined,
      );
      expect(
        currentDeliveryLocationRepository.saveDeliveryPersonLocation,
      ).toHaveBeenCalledWith(orderId, location);
    });

    test('실패하는 테스트, UnknownDataBaseError를 던짐', async () => {
      const dto = {
        orderId: 1,
        x: 128.25424,
        y: 35.95234,
      };
      const error = new UnknownDataBaseException(new Error('알 수 없는 에러'));
      currentDeliveryLocationRepository.saveDeliveryPersonLocation.mockRejectedValueOnce(
        error,
      );

      await expect(service.createCurrentLocation(dto)).rejects.toStrictEqual(
        error,
      );
    });
  });

  describe('matchDeliveryPersonAtOrder 테스트', () => {
    let service: OrderDeliveryPersonService;
    let manager: EntityManager;
    let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

    const currentDeliveryLocationRepository =
      mock<CurrentDeliveryLocationRepository>();
    const deliveryUrlCreator = mock<DeliveryUrlCreator>();
    const smsApi = mock<NaverSmsApi>();

    beforeEach(async () => {
      const dependencies = [
        {
          provide: RepositoryToken.ORDER_REPOSITORY,
          useClass: OrderRepository,
        },
        {
          provide: RepositoryToken.RECEIVER_REPOSITORY,
          useClass: ReceiverRepository,
        },
        {
          provide: RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY,
          useClass: DeliveryPersonMatchedDateRepository,
        },
        {
          provide: RepositoryToken.CURRENT_DELIVERY_LOCATION_REPOSITORY,
          useValue: currentDeliveryLocationRepository,
        },
        { provide: DeliveryUrlCreator, useValue: deliveryUrlCreator },
        { provide: NaverSmsApi, useValue: smsApi },
      ];
      const entities = [
        OrderEntity,
        ReceiverEntity,
        DeliveryPersonMatchedDateEntity,
      ];
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TestTypeormModule,
          TypeOrmModule.forFeature(entities),
          ClsModule,
        ],
        providers: [
          OrderDeliveryPersonService,
          ...dependencies,
          TransactionManager,
        ],
      }).compile();

      service = module.get<OrderDeliveryPersonService>(
        OrderDeliveryPersonService,
      );
      manager = module.get(EntityManager);
      cls = ClsServiceManager.getClsService();

      mockClear(deliveryUrlCreator);
      mockClear(smsApi);
    });

    const createUser = async (
      manager: EntityManager,
      {
        userId,
        walletAddress,
        contact,
      }: { userId: string; walletAddress: string; contact: string },
    ) => {
      const user = manager.create(UserEntity, {
        id: userId,
        walletAddress,
        name: '이름',
        email: '이메일',
        contact,
        birthDate: {
          id: userId,
          date: new Date(2000, 9, 12).toISOString(),
        },
        profileImage: {
          id: userId,
        },
        joinDate: {
          id: userId,
          date: new Date(2023, 9, 12).toISOString(),
        },
      });

      return await manager.save(UserEntity, user);
    };

    const createOrder = async (requester: User) => {
      const detail = '디테일';
      const product = {
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
      };
      const transportation: Partial<TransportationEntity> = {
        car: 1,
        truck: 1,
      };
      const destination = {
        x: 37.5,
        y: 112,
        detail: '디테일',
      };
      const receiver = {
        name: '이름',
        phone: '01012345678',
      };
      const departure = {
        x: 0,
        y: 0,
        detail: '디테일',
      };
      const sender = {
        name: '이름',
        phone: '01012345678',
      };

      await manager.transaction(async (manager) => {
        const id = 1;
        const order = manager.create(OrderEntity, {
          id,
          detail,
          requester,
        });

        await manager.save(OrderEntity, order);

        await manager.save(ProductEntity, {
          id,
          ...product,
          order: order,
        });
        await manager.save(TransportationEntity, {
          id,
          ...transportation,
          order: order,
        });
        await manager.save(DestinationEntity, {
          id,
          ...destination,
          order: order,
          receiver: {
            id,
            ...receiver,
          },
        });
        await manager.save(DepartureEntity, {
          id,
          ...departure,
          order: order,
          sender: {
            id,
            ...sender,
          },
        });
      });
    };

    beforeEach(async () => {
      const requester = await createUser(manager, {
        userId: 'io32f8',
        walletAddress: '0x3ifoi2jf',
        contact: '01012341234',
      });
      await createUser(manager, {
        userId: '320slkjer93',
        walletAddress: '배송원 지갑주소',
        contact: '01098769876',
      });

      await createOrder(requester);
    });

    afterEach(async () => {
      await manager.clear(OrderEntity);
      await manager.clear(UserEntity);
    });

    describe('트랜젝션 테스트', () => {
      test('통과하는 테스트', async () => {
        const orderId = 1;
        const walletAddress = '배송원 지갑주소';

        await expect(
          manager.findOne(ReceiverEntity, { where: { id: orderId } }),
        ).resolves.toEqual({
          id: 1,
          name: '이름',
          phone: '01012345678',
        });

        await cls.run(async () => {
          cls.set(ENTITY_MANAGER_KEY, manager);

          await service.matchDeliveryPersonAtOrder({ orderId, walletAddress });
        });

        await expect(
          manager.findOne(OrderEntity, {
            relations: {
              requester: true,
              deliveryPerson: true,
            },
            where: { id: 1 },
          }),
        ).resolves.toEqual({
          deliveryPerson: {
            contact: '01098769876',
            email: '이메일',
            id: '320slkjer93',
            name: '이름',
            walletAddress: '배송원 지갑주소',
          },
          detail: '디테일',
          id: 1,
          requester: {
            contact: '01012341234',
            email: '이메일',
            id: 'io32f8',
            name: '이름',
            walletAddress: '0x3ifoi2jf',
          },
        });
      });

      test('실패하는 테스트, db 계층에서 에러 NotExistDataError를 던짐', async () => {
        const orderId = 2;
        const walletAddress = '배송원 지갑주소';
        const error = new NotExistDataException('orderId', orderId);

        await cls.run(async () => {
          cls.set(ENTITY_MANAGER_KEY, manager);

          await expect(
            service.matchDeliveryPersonAtOrder({ orderId, walletAddress }),
          ).rejects.toStrictEqual(error);
        });

        await expect(
          manager.findOne(OrderEntity, {
            relations: {
              deliveryPerson: true,
            },
            where: { id: orderId },
          }),
        ).resolves.toEqual(null);
      });

      test('실패하는 테스트, 외부 api 에러 SmsApiError를 던짐', async () => {
        const response: NaverSmsApiResponse = {
          requestId: 'requestId',
          requestTime: 'requestTime',
          statusCode: 'statusCode',
          statusName: 'statusName',
        };
        const error = new SmsApiException(response);
        const walletAddress = '배송원 지갑주소';
        const orderId = 1;

        await createUser(manager, {
          userId: '0xjf823uh98h',
          walletAddress,
          contact: '01046631513',
        });

        smsApi.sendDeliveryTrackingMessage.mockRejectedValueOnce(error);

        await cls.run(async () => {
          cls.set(ENTITY_MANAGER_KEY, manager);

          await expect(
            service.matchDeliveryPersonAtOrder({ orderId, walletAddress }),
          ).rejects.toStrictEqual(error);
        });

        await expect(
          manager.findOne(OrderEntity, {
            relations: {
              deliveryPerson: true,
            },
            where: { id: 1 },
          }),
        ).resolves.toEqual({ deliveryPerson: null, detail: '디테일', id: 1 });
      });
    });
  });
});
