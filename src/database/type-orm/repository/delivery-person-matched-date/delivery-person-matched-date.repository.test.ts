import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { DuplicatedDataException } from '@src/core/exception';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import {
  DeliveryPersonMatchedDateEntity,
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  ProductEntity,
  TransportationEntity,
  UserEntity,
} from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { DeliveryPersonMatchedDateRepository } from './delivery-person-matched-date.repository';

describe('DeliveryPersonMatchedDateRepository', () => {
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

  const createOrder = async (
    manager: EntityManager,

    {
      requester,
      deliveryPerson,
      orderId,
    }: {
      requester: UserEntity;
      deliveryPerson: UserEntity | null;
      orderId: number;
    },
  ) => {
    await manager.transaction(async (manager) => {
      const order = manager.create(OrderEntity, {
        id: orderId,
        requester,
        deliveryPerson,
        detail: '디테일',
      });

      await manager.save(order);

      const id = orderId;

      const product = manager.create(ProductEntity, {
        id,
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
        order,
      });

      const transportation = manager.create(TransportationEntity, {
        id,
        walking: 0,
        bicycle: 0,
        scooter: 0,
        bike: 0,
        car: 0,
        truck: 0,
        order,
      });

      const destination = manager.create(DestinationEntity, {
        id,
        x: 37.5,
        y: 112,
        detail: '디테일',
        order,
        receiver: {
          id,
          name: '이름',
          phone: '01012345678',
        },
      });

      const departure = manager.create(DepartureEntity, {
        id,
        x: 0,
        y: 0,
        detail: '디테일',
        order,
        sender: {
          id,
          name: '이름',
          phone: '01012345678',
        },
      });

      await Promise.allSettled([
        manager.save(ProductEntity, product),
        manager.save(TransportationEntity, transportation),
        manager.save(DestinationEntity, destination),
        manager.save(DepartureEntity, departure),
      ]);

      return id;
    });
  };

  let testModule: TestingModule;
  let repository: DeliveryPersonMatchedDateRepository;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([DeliveryPersonMatchedDateEntity]),
        ClsModule,
      ],
      providers: [DeliveryPersonMatchedDateRepository, TransactionManager],
    }).compile();

    repository = testModule.get(DeliveryPersonMatchedDateRepository);
    manager = testModule.get(EntityManager);
    cls = ClsServiceManager.getClsService();
  });

  afterEach(async () => {
    await manager.clear(UserEntity);
    await manager.clear(OrderEntity);
  });

  describe('create', () => {
    beforeEach(async () => {
      const requester = await createUser(manager, {
        userId: '아이디',
        walletAddress: '지갑주소',
        contact: '01012341234',
      });

      await createOrder(manager, {
        requester,
        deliveryPerson: null,
        orderId: 1,
      });
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await repository.create(orderId);
      });

      await expect(
        manager.findOneBy(DeliveryPersonMatchedDateEntity, {
          id: orderId,
        }),
      ).resolves.toHaveProperty('id', orderId);
    });

    test('실패하는 테스트, 이미 존재하는 아이디로 생성하면 DuplicatedDataException을 던짐', async () => {
      const orderId = 1;
      const error = new DuplicatedDataException(orderId);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await repository.create(orderId);

        await expect(repository.create(orderId)).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findAllOrderIdByBetweenDates', () => {
    test('통과하는 테스트', async () => {
      const START_DATE = new Date(2000, 0, 1, 0, 0, 0, 0);
      const END_DATE = new Date(2000, 0, 31, 23, 59, 59, 999);

      const createDummyData = async () => {
        const requester = await createUser(manager, {
          userId: '아이디',
          walletAddress: '지갑주소',
          contact: '01012341234',
        });

        const deliveryPerson = await createUser(manager, {
          userId: '배송원 아이디',
          walletAddress: '배송원 지갑주소',
          contact: '01009870987',
        });

        await createOrder(manager, {
          orderId: 1,
          requester,
          deliveryPerson,
        });
        await createOrder(manager, {
          orderId: 2,
          requester,
          deliveryPerson,
        });
        await createOrder(manager, {
          orderId: 3,
          requester,
          deliveryPerson,
        });
        await createOrder(manager, {
          orderId: 4,
          requester,
          deliveryPerson,
        });

        await manager.save(DeliveryPersonMatchedDateEntity, [
          { id: 1, date: new Date(2000, 0, 0, 23, 59, 59, 999) },
          { id: 2, date: START_DATE },
          { id: 3, date: END_DATE },
          { id: 4, date: new Date(2000, 1, 1, 0, 0, 0, 0) },
        ]);
      };

      await createDummyData();

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAllOrderIdByBetweenDates(START_DATE, END_DATE),
        ).resolves.toEqual([{ id: 2 }, { id: 3 }]);
      });
    });
  });
});
