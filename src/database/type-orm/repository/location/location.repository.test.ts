import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import {
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import {
  BirthDateEntity,
  DepartureEntity,
  DestinationEntity,
  JoinDateEntity,
  OrderEntity,
  ProductEntity,
  ProfileImageEntity,
  ReceiverEntity,
  SenderEntity,
  TransportationEntity,
  UserEntity,
} from '@src/database/type-orm/entity';
import { mock } from 'jest-mock-extended';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { LocationRepository } from './location.repository';

describe('LocationRepository', () => {
  const createUser = async (manager: EntityManager) => {
    const id = '아이디';
    const user = {
      id,
      walletAddress: '지갑주소',
      name: '이름',
      email: '이메일',
      contact: '연락처',
    };

    const birthDate = {
      id,
      date: new Date(2000, 9, 12).toISOString(),
    };

    const profileImage = {
      id,
      imageId: '111',
    };

    const joinDate = {
      id,
      date: new Date(2023, 9, 12).toISOString(),
    };

    await manager.transaction(async (manager) => {
      await manager.insert(UserEntity, user);
      await manager.insert(BirthDateEntity, birthDate);
      await manager.insert(ProfileImageEntity, profileImage);
      await manager.insert(JoinDateEntity, joinDate);
    });

    return await manager.findOneBy(UserEntity, {
      id: '아이디',
    });
  };

  const createOrder = async (manager: EntityManager, requester: UserEntity) => {
    const detail = '디테일';
    const product = {
      width: 0,
      length: 0,
      height: 0,
      weight: 0,
    };
    const transportation: Partial<TransportationEntity> = {
      walking: 0,
      bicycle: 0,
      scooter: 0,
      bike: 0,
      car: 0,
      truck: 0,
    };
    const receiver = {
      name: '이름',
      phone: '01012345678',
    };
    const destination = {
      x: 127.8494,
      y: 37.5,
      detail: '디테일',
    };
    const departure = {
      x: 127.09,
      y: 37.527,
      detail: '디테일',
    };
    const sender = {
      name: '이름',
      phone: '01012345678',
    };

    await manager.transaction(async (manager) => {
      const order = manager.create(OrderEntity, {
        detail,
        requester,
      });

      await manager.insert(OrderEntity, order);

      const id = order.id;

      await manager.insert(ProductEntity, {
        id,
        ...product,
      });
      await manager.insert(TransportationEntity, {
        id,
        ...transportation,
      });
      await manager.insert(DestinationEntity, {
        id,
        ...destination,
      });
      await manager.insert(ReceiverEntity, {
        id,
        ...receiver,
      });
      await manager.insert(DepartureEntity, {
        id,
        ...departure,
      });
      await manager.insert(SenderEntity, {
        id,
        ...sender,
      });
    });
  };

  let testModule: TestingModule;
  let repository: LocationRepository;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([OrderEntity]),
        ClsModule,
      ],
      providers: [LocationRepository, TransactionManager],
    }).compile();

    repository = testModule.get(LocationRepository);
    manager = testModule.get(EntityManager);
    cls = ClsServiceManager.getClsService();
  });

  beforeAll(async () => {
    const user = await createUser(manager);
    await createOrder(manager, user);
    await createOrder(manager, user);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('findDestinationDepartureByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        id: orderId,
        departure: { x: 127.09, y: 37.527 },
        destination: { x: 127.8494, y: 37.5 },
      };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findDestinationDepartureByOrderId(orderId),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하지 않는 주문 아이디로 조회하면 NotExistDataException을 던짐', async () => {
      const orderId = 32;
      const error = new NotExistDataException(orderId);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findDestinationDepartureByOrderId(orderId),
        ).rejects.toEqual(error);
      });
    });

    test('실패하는 테스트, 함수 내부에서 예측하지 못한 에러가 발생하면 UnknownDataBaseException을 던짐', async () => {
      const orderId = 1;
      const originalError = new Error('알 수 없는 에러');
      const error = new UnknownDataBaseException(originalError);

      await cls.run(async () => {
        const manager = mock<EntityManager>();
        manager.findOne.mockRejectedValueOnce(originalError);

        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findDestinationDepartureByOrderId(orderId),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findAllDestinationDepartureByOrderIds', () => {
    test('통과하는 테스트', async () => {
      const orderIds = [1, 2];
      const result = [
        {
          id: 2,
          departure: { x: 127.09, y: 37.527 },
          destination: { x: 127.8494, y: 37.5 },
        },
        {
          id: 1,
          departure: { x: 127.09, y: 37.527 },
          destination: { x: 127.8494, y: 37.5 },
        },
      ];

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAllDestinationDepartureByOrderIds(orderIds),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하는 주문아이다와 존재하지 않는 아이디를 섞어서 입력하면 존재하는 아이디에 해당되는 정보만 반환', async () => {
      const orderIds = [2, 3];
      const result = [
        {
          id: 2,
          departure: { x: 127.09, y: 37.527 },
          destination: { x: 127.8494, y: 37.5 },
        },
      ];

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAllDestinationDepartureByOrderIds(orderIds),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하지 않는 아아디만 입력하면 빈 배열 반환', async () => {
      const orderIds = [3, 4];
      const result = [];

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAllDestinationDepartureByOrderIds(orderIds),
        ).resolves.toEqual(result);
      });
    });
  });
});
